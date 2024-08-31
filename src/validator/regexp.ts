import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
// 定义一个正则表达式匹配的执行验证器常量，用于根据规则验证值的有效性
const regexp: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
    if (!isEmptyValue(value)) {
      rules.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};

export default regexp;
