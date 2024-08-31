import { ExecuteRule } from '../interface';
import { format, isEmptyValue } from '../util';
/**
 * 验证规则是否要求字段为必填
 * 
 * 此函数主要用于校验规则中指定的字段是否为必填项，如果是必填项且字段值为空，则添加错误信息
 * 它通过检查源对象中是否包含该字段，以及字段值是否为空来判断是否需要添加错误信息
 * 
 * @param rule 校验规则，包含字段相关信息如字段名、字段类型等
 * @param value 字段的值，用于判断是否为空
 * @param source 源对象，即包含待校验字段的原始数据对象
 * @param errors 错误信息数组，当校验不通过时，会将错误信息添加到此数组中
 * @param options 选项，包含错误信息的模板和校验消息
 * @param type 字段的类型，用于判断值是否为空；如果未提供，则使用规则中的类型
 */
const required: ExecuteRule = (rule, value, source, errors, options, type) => {
  if (
    rule.required &&
    (!source.hasOwnProperty(rule.field) ||
      isEmptyValue(value, type || rule.type))
  ) {
    errors.push(format(options.messages.required, rule.fullField));
  }
};

export default required;
