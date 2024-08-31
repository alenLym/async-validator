import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';

const ENUM = 'enum' as const;
// 定义一个可枚举值的校验器，用于执行规则验证
// 参数 rule 表示验证规则，value 表示待验证的值，callback 表示验证完成后的回调函数
// source 表示值的来源对象，options 表示额外的选项
const enumerable: ExecuteValidator = (
  rule,
  value,
  callback,
  source,
  options,
) => {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
    if (value !== undefined) {
      rules[ENUM](rule, value, source, errors, options);
    }
  }
  callback(errors);
};

export default enumerable;
