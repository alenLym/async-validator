import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 类型执行验证器常量
 * 该函数用于验证给定的规则、值以及在特定源对象中进行验证的过程
 * 它首先检查是否需要进行验证，然后根据规则类型执行相应的验证逻辑
 * 
 * @param rule 验证规则对象，包含验证所需的全部信息如类型和是否必填
 * @param value 正在验证的值
 * @param callback 回调函数，用于在验证完成后调用，传递错误数组作为参数
 * @param source 源数据对象，从中获取验证字段的值
 * @param options 额外选项，可用于扩展验证逻辑
 * @returns 无，但通过回调函数传递错误数组
 */
const type: ExecuteValidator = (rule, value, callback, source, options) => {
  const ruleType = rule.type;
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, ruleType) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options, ruleType);
    if (!isEmptyValue(value, ruleType)) {
      rules.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};

export default type;
