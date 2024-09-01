import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
// 定义一个类型为 ExecuteValidator 的常量 any，用于执行验证规则
// 这个函数主要用于校验给定的值是否满足指定的规则条件
/**
 * 函数 'any' 是 TypeScript 中的验证器，用于检查值是否满足某些规则和
 * 返回找到的任何错误。
 * @param rule - 'any' 函数中的 'rule' 参数表示需要的验证规则
 * 应用于 'value'。它包含字段是否为必填字段、
 * 字段以及任何其他验证标准。
 * @param值 - 'any' 函数中的 'value' 参数表示需要的值
 * 根据指定的规则进行验证。
 * @param callback - 代码片段中的 'callback' 参数是一个函数，用于传递
 * 错误返回到调用代码。如果
 * 验证失败，如果验证成功，则没有参数。
 * @param source - 'any' 函数中的 'source' 参数引用包含
 * 正在验证的数据。它用于访问验证规则中指定的字段 （'rule.field'）
 * 并检查它是否存在于 source 对象中。
 * @param选项 - 选项是一个对象，其中包含其他配置或设置，这些配置或设置可以是
 * 传递给 Validator 函数。它可以包括可以使用的各种属性或值
 * 以自定义验证过程的行为。
 * @returns 正在返回 'callback（errors）'。
 */
const any: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
  }
  callback(errors);
};

export default any;
