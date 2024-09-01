import {
  format,
  complementError,
  asyncMap,
  warning,
  deepMerge,
  convertFieldsError,
} from './util';
import validators from './validator/index';
import { messages as defaultMessages, newMessages } from './messages';
import {
  InternalRuleItem,
  InternalValidateMessages,
  Rule,
  RuleItem,
  Rules,
  ValidateCallback,
  ValidateMessages,
  ValidateOption,
  Values,
  RuleValuePackage,
  ValidateError,
  ValidateFieldsError,
  SyncErrorType,
  ValidateResult,
} from './interface';

export * from './interface';

/**
 *  Encapsulates a validation schema.
 *
 *  @param descriptor An object declaring validation rules
 *  for this schema.
 */
class Schema {
  // ========================= Static =========================
  static register = function register(type: string, validator) {
    if (typeof validator !== 'function') {
      throw new Error(
        'Cannot register a validator by type, validator is not a function',
      );
    }
    validators[type] = validator;
  };

  static warning = warning;

  static messages = defaultMessages;

  static validators = validators;

  // ======================== Instance ========================
  rules: Record<string, RuleItem[]> = null;
  _messages: InternalValidateMessages = defaultMessages;

  constructor(descriptor: Rules) {
    this.define(descriptor);
  }
  /**
   * 定义验证规则的方法
   * 
   * 本方法用于接收一组规则，并将其配置到当前的模式对象中
   * 如果传入的规则不符合预期格式或类型，将抛出错误
   * 
   * @param rules 验证规则对象，必须为非空对象
   * @throws {Error} 如果未传入规则或规则不是对象，则抛出错误
   * @throws {Error} 如果规则是以数组形式存在，则抛出错误
   */
  define(rules: Rules) {
    if (!rules) {
      throw new Error('Cannot configure a schema with no rules');
    }
    if (typeof rules !== 'object' || Array.isArray(rules)) {
      throw new Error('Rules must be an object');
    }
    this.rules = {};

    Object.keys(rules).forEach(name => {
      const item: Rule = rules[name];
      this.rules[name] = Array.isArray(item) ? item : [item];
    });
  }
  /**
   * 设置或获取验证消息
   * 
   * 此方法用于在验证过程中定制化错误提示信息它允许从外部传入一组消息来覆盖默认的验证错误信息
   * 如果没有传入参数，则返回当前的消息配置
   * 
   * @param messages 可选参数，用于传入自定义的验证错误消息
   * @returns 如果传入参数，则返回更新后的消息配置；如果没有传入参数，则返回当前的消息配置
   */
  messages(messages?: ValidateMessages) {
    if (messages) {
      this._messages = deepMerge(newMessages(), messages);
    }
    return this._messages;
  }

  validate(
    source: Values,
    option?: ValidateOption,
    callback?: ValidateCallback,
  ): Promise<Values>;
  validate(source: Values, callback: ValidateCallback): Promise<Values>;
  validate(source: Values): Promise<Values>;

  validate(source_: Values, o: any = {}, oc: any = () => { }): Promise<Values> {
    let source: Values = source_;
    let options: ValidateOption = o;
    let callback: ValidateCallback = oc;
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!this.rules || Object.keys(this.rules).length === 0) {
      if (callback) {
        callback(null, source);
      }
      return Promise.resolve(source);
    }
    /**
     * 完成验证过程的方法，汇总所有验证结果并进行处理
     * @param results 验证结果数组，每个元素可以是单个验证错误或验证错误数组
     */
    function complete(results: (ValidateError | ValidateError[])[]) {
      let errors: ValidateError[] = [];
      let fields: ValidateFieldsError = {};

      function add(e: ValidateError | ValidateError[]) {
        if (Array.isArray(e)) {
          errors = errors.concat(...e);
        } else {
          errors.push(e);
        }
      }

      for (let i = 0; i < results.length; i++) {
        add(results[i]);
      }
      if (!errors.length) {
        callback(null, source);
      } else {
        fields = convertFieldsError(errors);
        (callback as (
          errors: ValidateError[],
          fields: ValidateFieldsError,
        ) => void)(errors, fields);
      }
    }

    if (options.messages) {
      let messages = this.messages();
      if (messages === defaultMessages) {
        messages = newMessages();
      }
      deepMerge(messages, options.messages);
      options.messages = messages;
    } else {
      options.messages = this.messages();
    }

    const series: Record<string, RuleValuePackage[]> = {};
    const keys = options.keys || Object.keys(this.rules);
    keys.forEach(z => {
      const arr = this.rules[z];
      let value = source[z];
      arr.forEach(r => {
        let rule: InternalRuleItem = r;
        if (typeof rule.transform === 'function') {
          if (source === source_) {
            source = { ...source };
          }
          value = source[z] = rule.transform(value);
        }
        if (typeof rule === 'function') {
          rule = {
            validator: rule,
          };
        } else {
          rule = { ...rule };
        }

        // Fill validator. Skip if nothing need to validate
        rule.validator = this.getValidationMethod(rule);
        if (!rule.validator) {
          return;
        }

        rule.field = z;
        rule.fullField = rule.fullField || z;
        rule.type = this.getType(rule);
        series[z] = series[z] || [];
        series[z].push({
          rule,
          value,
          source,
          field: z,
        });
      });
    });
    const errorFields = {};
    return asyncMap(
      series,
      options,
      (data, doIt) => {
        const rule = data.rule;
        let deep =
          (rule.type === 'object' || rule.type === 'array') &&
          (typeof rule.fields === 'object' ||
            typeof rule.defaultField === 'object');
        deep = deep && (rule.required || (!rule.required && data.value));
        rule.field = data.field;

        function addFullField(key: string, schema: RuleItem) {
          return {
            ...schema,
            fullField: `${rule.fullField}.${key}`,
            fullFields: rule.fullFields ? [...rule.fullFields, key] : [key],
          };
        }

        function cb(e: SyncErrorType | SyncErrorType[] = []) {
          let errorList = Array.isArray(e) ? e : [e];
          if (!options.suppressWarning && errorList.length) {
            Schema.warning('async-validator:', errorList);
          }
          if (errorList.length && rule.message !== undefined) {
            errorList = [].concat(rule.message);
          }

          // Fill error info
          let filledErrors = errorList.map(complementError(rule, source));

          if (options.first && filledErrors.length) {
            errorFields[rule.field] = 1;
            return doIt(filledErrors);
          }
          if (!deep) {
            doIt(filledErrors);
          } else {
            // if rule is required but the target object
            // does not exist fail at the rule level and don't
            // go deeper
            if (rule.required && !data.value) {
              if (rule.message !== undefined) {
                filledErrors = []
                  .concat(rule.message)
                  .map(complementError(rule, source));
              } else if (options.error) {
                filledErrors = [
                  options.error(
                    rule,
                    format(options.messages.required, rule.field),
                  ),
                ];
              }
              return doIt(filledErrors);
            }

            let fieldsSchema: Record<string, Rule> = {};
            if (rule.defaultField) {
              Object.keys(data.value).map(key => {
                fieldsSchema[key] = rule.defaultField;
              });
            }
            fieldsSchema = {
              ...fieldsSchema,
              ...data.rule.fields,
            };

            const paredFieldsSchema: Record<string, RuleItem[]> = {};

            Object.keys(fieldsSchema).forEach(field => {
              const fieldSchema = fieldsSchema[field];
              const fieldSchemaList = Array.isArray(fieldSchema)
                ? fieldSchema
                : [fieldSchema];
              paredFieldsSchema[field] = fieldSchemaList.map(
                addFullField.bind(null, field),
              );
            });
            const schema = new Schema(paredFieldsSchema);
            schema.messages(options.messages);
            if (data.rule.options) {
              data.rule.options.messages = options.messages;
              data.rule.options.error = options.error;
            }
            schema.validate(data.value, data.rule.options || options, errs => {
              const finalErrors = [];
              if (filledErrors && filledErrors.length) {
                finalErrors.push(...filledErrors);
              }
              if (errs && errs.length) {
                finalErrors.push(...errs);
              }
              doIt(finalErrors.length ? finalErrors : null);
            });
          }
        }

        let res: ValidateResult;
        if (rule.asyncValidator) {
          res = rule.asyncValidator(rule, data.value, cb, data.source, options);
        } else if (rule.validator) {
          try {
            res = rule.validator(rule, data.value, cb, data.source, options);
          } catch (error) {
            console.error?.(error);
            // rethrow to report error
            if (!options.suppressValidatorError) {
              setTimeout(() => {
                throw error;
              }, 0);
            }
            cb(error.message);
          }
          if (res === true) {
            cb();
          } else if (res === false) {
            cb(
              typeof rule.message === 'function'
                ? rule.message(rule.fullField || rule.field)
                : rule.message || `${rule.fullField || rule.field} fails`,
            );
          } else if (res instanceof Array) {
            cb(res);
          } else if (res instanceof Error) {
            cb(res.message);
          }
        }
        if (res && (res as Promise<void>).then) {
          (res as Promise<void>).then(
            () => cb(),
            e => cb(e),
          );
        }
      },
      results => {
        complete(results);
      },
      source,
    );
  }
  /**
   * 获取规则的类型
   * 如果规则的类型未定义，则尝试根据规则的模式将其类型设置为'pattern'
   * 此外，如果规则的验证器不是函数，并且规则的类型已定义，但不在validators中，
   * 则抛出错误表示未知的规则类型
   * 
   * @param rule 内部规则项，包含类型和模式等信息
   * @returns 返回规则的类型，如果未定义则默认为'string'
   */
  getType(rule: InternalRuleItem) {
    if (rule.type === undefined && rule.pattern instanceof RegExp) {
      rule.type = 'pattern';
    }
    if (
      typeof rule.validator !== 'function' &&
      rule.type &&
      !validators.hasOwnProperty(rule.type)
    ) {
      throw new Error(format('Unknown rule type %s', rule.type));
    }
    return rule.type || 'string';
  }
  /**
   * 获取验证方法
   * 根据给定的验证规则项，动态确定使用哪个验证函数
   * 
   * @param rule 验证规则项，包含了验证逻辑和可能的自定义验证函数
   * @returns 返回找到的验证函数，如果没有匹配的验证函数则返回undefined
   */
  getValidationMethod(rule: InternalRuleItem) {
    if (typeof rule.validator === 'function') {
      return rule.validator;
    }
    const keys = Object.keys(rule);
    const messageIndex = keys.indexOf('message');
    if (messageIndex !== -1) {
      keys.splice(messageIndex, 1);
    }
    if (keys.length === 1 && keys[0] === 'required') {
      return validators.required;
    }
    return validators[this.getType(rule)] || undefined;
  }
}

export default Schema;
