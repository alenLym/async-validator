import { ExecuteRule } from '../interface';
import { format } from '../util';

/**
 * TypeScript 中的函数 'range' 根据指定的规则验证值的长度或范围
 * 如果验证失败，则会生成错误消息。
 * @param rule - 'range' 函数中的 'rule' 参数表示需要的验证规则
 * 应用于 'value'。它包含诸如 'len'、'min' 和 'max' 之类的属性，这些属性定义了
 * 验证的约束。'rule' 对象用于确定 'value
 * @param值 - 'range' 函数中的 'value' 参数表示需要的值
 * 根据指定的范围规则进行验证。它可以是数字、字符串或数组，具体取决于
 * 正在验证的数据。该函数检查 'value' 的类型并执行范围验证
 * 基于
 * @param source - 'range' 函数中的 'source' 参数通常用于提供
 * 函数执行其验证逻辑可能需要的其他上下文或数据。可能是
 * 正在验证的数据的来源，例如表单字段值、API 响应或任何其他
 * input 需要
 * @param errors - 'range' 函数中的 'errors' 参数是一个数组，用于存储任何
 * 验证过程中发生的验证错误。如果不满足验证规则，则
 * 错误消息被推送到此数组中，以指示特定的验证失败。这个数组可以
 * 然后用于显示
 * @param选项 - 'range' 函数中的 'options' 参数是一个包含各种
 * 验证过程的配置选项。这些选项可以包含不同
 * 验证错误的类型，例如 'len'、'min'、'max' 和 'range'。'options' 对象允许
 * 用于定制
 * @returns 如果值不是 支持的类型，则 'range' 函数返回 'false'
 * 范围验证，或者根据验证规则将错误消息推送到 'errors' 数组中
 * 在 'rule' 对象中提供。
 */
const range: ExecuteRule = (rule, value, source, errors, options) => {
  const len = typeof rule.len === 'number';
  const min = typeof rule.min === 'number';
  const max = typeof rule.max === 'number';
  // 正则匹配码点范围从U+010000一直到U+10FFFF的文字（补充平面Supplementary Plane）
  const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  let val = value;
  let key = null;
  const num = typeof value === 'number';
  const str = typeof value === 'string';
  const arr = Array.isArray(value);
  if (num) {
    key = 'number';
  } else if (str) {
    key = 'string';
  } else if (arr) {
    key = 'array';
  }
  // if the value is not of a supported type for range validation
  // the validation rule rule should use the
  // type property to also test for a particular type
  if (!key) {
    return false;
  }
  if (arr) {
    val = value.length;
  }
  if (str) {
    // 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".length !== 3
    val = value.replace(spRegexp, '_').length;
  }
  if (len) {
    if (val !== rule.len) {
      errors.push(format(options.messages[key].len, rule.fullField, rule.len));
    }
  } else if (min && !max && val < rule.min) {
    errors.push(format(options.messages[key].min, rule.fullField, rule.min));
  } else if (max && !min && val > rule.max) {
    errors.push(format(options.messages[key].max, rule.fullField, rule.max));
  } else if (min && max && (val < rule.min || val > rule.max)) {
    errors.push(
      format(options.messages[key].range, rule.fullField, rule.min, rule.max),
    );
  }
};

export default range;
