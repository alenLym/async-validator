import { ExecuteValidator } from '../interface';
import rules from '../rule';
import { isEmptyValue } from '../util';
/**
 * 验证日期格式的校验器
 * 此函数用于校验字段的值是否符合日期类型以及是否满足特定的日期规则
 * @param rule 日期校验规则，包含必要的日期字段信息
 * @param value 当前正在校验的值
 * @param callback 回调函数，用于返回校验结果
 * @param source 数据源，包含所有字段和它们的值
 * @param options 额外选项，可选参数
 */
const date: ExecuteValidator = (rule, value, callback, source, options) => {
  // console.log('integer rule called %j', rule);
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  // console.log('validate on %s value', value);
  if (validate) {
    if (isEmptyValue(value, 'date') && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options);
    if (!isEmptyValue(value, 'date')) {
      let dateObject;

      if (value instanceof Date) {
        dateObject = value;
      } else {
        dateObject = new Date(value);
      }

      rules.type(rule, dateObject, source, errors, options);
      if (dateObject) {
        rules.range(rule, dateObject.getTime(), source, errors, options);
      }
    }
  }
  callback(errors);
};

export default date;
