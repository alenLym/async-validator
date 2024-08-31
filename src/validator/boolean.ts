import { isEmptyValue } from '../util';
import rules from '../rule';
import { ExecuteValidator } from '../interface';
// 定义一个布尔验证规则函数，用于校验给定的值是否符合指定的规则
const boolean: ExecuteValidator = (rule, value, callback, source, options) => {
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
    }
  }
  callback(errors);
};

export default boolean;
