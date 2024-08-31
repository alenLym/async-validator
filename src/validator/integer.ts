import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 整数验证函数，用于验证值是否符合指定规则。
 * 
 * @param rule 验证规则，用于确定执行何种验证逻辑。
 * @param value 要验证的值。
 * @param callback 回调函数，用于返回错误信息数组。
 * @param source 数据源，包含所有字段值的对象。
 * @param options 额外选项。
 */
const integer: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
    if (value !== undefined) {
      rules.type(rule, value, source, errors, options);
      rules.range(rule, value, source, errors, options);
    }
  }
  callback(errors);
};

export default integer;
