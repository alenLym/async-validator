import { ExecuteRule } from '../interface';
import { format } from '../util';

const ENUM = 'enum' as const;
/**
 * enumerable规则执行函数
 * 该函数用于检查给定的值是否属于规则中指定的可枚举值之一
 * 如果不属于，則生成相应的错误信息
 * 
 * @param rule 规则对象，包含有ENUM属性，以及其他必要信息
 * @param value 需要检查的值，确保该值在ENUM数组中
 * @param source 数据源，此处未使用，但作为错误处理时的上下文
 * @param errors 错误数组，当值不在ENUM中时，向其中添加错误信息
 * @param options 选项对象，包含消息模板和配置信息
 */
const enumerable: ExecuteRule = (rule, value, source, errors, options) => {
  rule[ENUM] = Array.isArray(rule[ENUM]) ? rule[ENUM] : [];
  if (rule[ENUM].indexOf(value) === -1) {
    errors.push(
      format(options.messages[ENUM], rule.fullField, rule[ENUM].join(', ')),
    );
  }
};

export default enumerable;
