import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
// 定义一个浮点数验证函数，用于验证传入的值是否符合指定的规则
const floatFn: ExecuteValidator = (rule, value, callback, source, options) => {
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

export default floatFn;
