import { ExecuteRule } from '../interface';
import { format } from '../util';

/**
 * whitespace 是一个校验规则，用于检测字段值是否仅为空白字符或空字符串
 * 此规则的主要目的是确保字段内容不为空，并且不只包含空格、制表符等空白字符
 * 
 * @param rule 当前执行的规则对象，包含规则的详细信息
 * @param value 当前需要验证的字段值
 * @param source 数据源对象，包含所有字段的值
 * @param errors 错误信息数组，用于存放验证失败时的错误提示
 * @param options 配置选项对象，包含自定义消息等扩展信息
 */
const whitespace: ExecuteRule = (rule, value, source, errors, options) => {
  if (/^\s+$/.test(value) || value === '') {
    errors.push(format(options.messages.whitespace, rule.fullField));
  }
};

export default whitespace;
