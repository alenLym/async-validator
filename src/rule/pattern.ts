import { ExecuteRule } from '../interface';
import { format } from '../util';
// 根据规则对象执行正则匹配验证
// 此函数用于验证给定的值是否符合规则对象中指定的正则表达式模式
// 参数:
// - rule: 验证规则对象，包含pattern属性等
// - value: 需要验证的值
// - source: 值的来源对象
// - errors: 错误信息数组，当验证不通过时向其中添加错误详情
// - options: 配置选项对象，包括错误信息模板等
const pattern: ExecuteRule = (rule, value, source, errors, options) => {
  if (rule.pattern) {
    if (rule.pattern instanceof RegExp) {
      // if a RegExp instance is passed, reset `lastIndex` in case its `global`
      // flag is accidentally set to `true`, which in a validation scenario
      // is not necessary and the result might be misleading
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(value)) {
        errors.push(
          format(
            options.messages.pattern.mismatch,
            rule.fullField,
            value,
            rule.pattern,
          ),
        );
      }
    } else if (typeof rule.pattern === 'string') {
      const _pattern = new RegExp(rule.pattern);
      if (!_pattern.test(value)) {
        errors.push(
          format(
            options.messages.pattern.mismatch,
            rule.fullField,
            value,
            rule.pattern,
          ),
        );
      }
    }
  }
};

export default pattern;
