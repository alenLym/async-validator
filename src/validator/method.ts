import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 执行验证规则的方法
 * 
 * 该方法根据传入的规则和值，验证值是否符合规则的要求
 * 如果验证失败，将收集错误信息并将其作为回调函数的参数
 * 
 * @param rule 验证规则，用于确定如何验证值
 * @param value 要验证的值
 * @param callback 回调函数，用于处理验证后的结果
 * @param source 值的来源对象，用于上下文判断
 * @param options 额外选项，用于传递更多验证所需的参数
 */
const method: ExecuteValidator = (rule, value, callback, source, options) => {
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

export default method;
