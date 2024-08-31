import { ExecuteValidator } from '../interface';
import rules from '../rule';
/**
 * `required` 是一个执行验证器，用于检查给定的值是否符合特定的规则.
 * 它主要用于校验表单或其他输入中的数据是否满足特定的条件，如非空校验.
 * 
 * @param rule - 要验证的规则对象，包含了验证规则的具体信息.
 * @param value - 需要验证的值.
 * @param callback - 回调函数，用于返回验证结果或错误信息.
 * @param source - 数据源，通常是包含待验证值的整个对象.
 * @param options - 验证器的选项，可以包含额外的验证逻辑或参数.
 * 
 * 函数内部会根据给定的值和规则，判断该值是否符合预期的类型和验证条件.
 * 如果发现错误，会将错误信息存储在一个数组中，并通过回调函数返回这个数组.
 * 如果没有错误，则通过回调函数返回一个空数组，表示验证通过.
 */
const required: ExecuteValidator = (rule, value, callback, source, options) => {
  const errors: string[] = [];
  const type = Array.isArray(value) ? 'array' : typeof value;
  rules.required(rule, value, source, errors, options, type);
  callback(errors);
};

export default required;
