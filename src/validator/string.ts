import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 字符串类型验证器常量，用于执行一系列验证规则
 * @param rule 验证规则对象，包含了待验证的字段及其验证条件
 * @param value 待验证的值
 * @param callback 回调函数，用于返回验证结果
 * @param source 源数据对象，包含了待验证的字段及其值
 * @param options 验证选项，可能包含额外的验证参数
 */
const string: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, 'string') && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options, 'string');
    if (!isEmptyValue(value, 'string')) {
      rules.type(rule, value, source, errors, options);
      rules.range(rule, value, source, errors, options);
      rules.pattern(rule, value, source, errors, options);
      if (rule.whitespace === true) {
        rules.whitespace(rule, value, source, errors, options);
      }
    }
  }
  callback(errors);
};

export default string;
