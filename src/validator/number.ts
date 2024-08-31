import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 数值类型验证器函数
 * 此函数用于校验给定的值是否符合指定的规则，包括是否为必填项，以及值的类型和范围
 * 
 * @param rule 规则对象，包含字段校验规则如是否必填、字段类型和取值范围等
 * @param value 待校验的值
 * @param callback 回调函数，用于返回校验结果或错误信息
 * @param source 值的来源对象，通常包含多个字段和值
 * @param options 额外选项，可用于扩展校验逻辑
 */
const number: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (value === '') {
      value = undefined;
    }
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

export default number;
