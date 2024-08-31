import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
// 定义一个常量对象，作为执行验证器函数
// 该验证器用于根据规则对象对给定值进行验证，并通过回调函数返回验证结果
// rule: 验证规则对象，包含验证的详细规则和条件
// value: 需要验证的值
// callback: 回调函数，用于返回验证后的错误数组
// source: 原始数据源对象，用于上下文判断
// options: 额外选项对象，可用于扩展验证逻辑
const object: ExecuteValidator = (rule, value, callback, source, options) => {
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

export default object;
