/* eslint no-console:0 */

import {
  ValidateError,
  ValidateOption,
  RuleValuePackage,
  InternalRuleItem,
  SyncErrorType,
  RuleType,
  Value,
  Values,
} from './interface';

const formatRegExp = /%[sdj%]/g;

declare var ASYNC_VALIDATOR_NO_WARNING;
/**
 * 警告通知函数
 * 该函数用于显示不同类型的警告信息，以及相关的错误详情
 * 
 * @param type 警告类型，表示触发警告的原因
 * @param errors 错误详情数组，包含所有相关的同步错误类型
 *                这允许在特定类型的警告中包含多个错误信息，便于进行详细的错误处理
 */
export let warning: (type: string, errors: SyncErrorType[]) => void = () => {};

// don't print warning message when in production env or node runtime
if (
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production' &&
  typeof window !== 'undefined' &&
  typeof document !== 'undefined'
) {
  warning = (type, errors) => {
    if (
      typeof console !== 'undefined' &&
      console.warn &&
      typeof ASYNC_VALIDATOR_NO_WARNING === 'undefined'
    ) {
      if (errors.every(e => typeof e === 'string')) {
        console.warn(type, errors);
      }
    }
  };
}
/**
 * 将验证错误按字段进行分组
 * 
 * 此函数的目的是接收一个验证错误数组，并将其按照错误所属的字段进行分类，从而方便后续处理
 * 每个验证错误对象包含一个字段名和错误信息，因此通过这个函数，可以得到一个对象，其中每个键是字段名，值是该字段的所有验证错误数组
 * 
 * @param errors 验证错误数组，包含了所有验证失败的错误信息
 * @returns 返回一个记录类型对象，其中每个键是字段名（field），值是该字段对应的验证错误数组
 * 如果输入的错误数组为空或无元素，则返回null
 */
export function convertFieldsError(
  errors: ValidateError[],
): Record<string, ValidateError[]> {
  if (!errors || !errors.length) return null;
  const fields = {};
  errors.forEach(error => {
    const field = error.field;
    fields[field] = fields[field] || [];
    fields[field].push(error);
  });
  return fields;
}
/**
 * 格式化函数，可以接受字符串模板或返回字符串的函数
 * 以及一系列参数，用于格式化输出
 * 
 * @param template 字符串模板或返回字符串的函数 如果是函数，则直接执行并返回结果
 *                  如果是字符串，则会替换其中的格式化字符为对应的参数值
 * @param args 一系列参数，用于格式化字符串
 * @returns 返回格式化后的字符串
 */
export function format(
  template: ((...args: any[]) => string) | string,
  ...args: any[]
): string {
  let i = 0;
  const len = args.length;
  if (typeof template === 'function') {
    return template.apply(null, args);
  }
  if (typeof template === 'string') {
    let str = template.replace(formatRegExp, x => {
      if (x === '%%') {
        return '%';
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case '%s':
          return String(args[i++]);
        case '%d':
          return (Number(args[i++]) as unknown) as string;
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
          break;
        default:
          return x;
      }
    });
    return str;
  }
  return template;
}
/**
 * 检查给定的类型是否为原生字符串类型
 * 
 * 此函数旨在验证输入的类型是否属于一组特定的原生字符串类型，这些类型包括：
 * - 'string'：通用字符串类型
 * - 'url'：表示URL的字符串类型
 * - 'hex'：表示十六进制颜色值的字符串类型
 * - 'email'：表示电子邮件地址的字符串类型
 * - 'date'：表示日期的字符串类型
 * - 'pattern'：表示正则表达式的字符串类型
 * 
 * @param type 要检查的字符串类型
 * @returns 如果给定类型是上述原生字符串类型之一，则返回true；否则返回false
 */
function isNativeStringType(type: string) {
  return (
    type === 'string' ||
    type === 'url' ||
    type === 'hex' ||
    type === 'email' ||
    type === 'date' ||
    type === 'pattern'
  );
}
/**
 * 检查给定的值是否为空值
 * 
 * 此函数用于判断传入的值是否为特定类型的空值，包括未定义、空数组或空字符串
 * 它根据值的类型和指定的类型参数来决定是否认为该值为空
 * 
 * @param value 要检查的值，任何类型
 * @param type 可选的类型字符串，用于指定如何解释`value`的类型
 * @returns 如果`value`被认为是空值，则返回`true`；否则返回`false`
 */
export function isEmptyValue(value: Value, type?: string) {
  if (value === undefined || value === null) {
    return true;
  }
  if (type === 'array' && Array.isArray(value) && !value.length) {
    return true;
  }
  if (isNativeStringType(type) && typeof value === 'string' && !value) {
    return true;
  }
  return false;
}

export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}
/**
 * 检查给定的类型是否为原生字符串类型
 * 
 * 此函数旨在验证输入的类型是否属于一组特定的原生字符串类型，这些类型包括：
 * - 'string'：通用字符串类型
 * - 'url'：表示URL的字符串类型
 * - 'hex'：表示十六进制颜色值的字符串类型
 * - 'email'：表示电子邮件地址的字符串类型
 * - 'date'：表示日期的字符串类型
 * - 'pattern'：表示正则表达式的字符串类型
 * 
 * @param type 要检查的字符串类型
 * @returns 如果给定类型是上述原生字符串类型之一，则返回true；否则返回false
 */
function asyncParallelArray(
  arr: RuleValuePackage[],
  func: ValidateFunc,
  callback: (errors: ValidateError[]) => void,
) {
  const results: ValidateError[] = [];
  let total = 0;
  const arrLength = arr.length;

  function count(errors: ValidateError[]) {
    results.push(...(errors || []));
    total++;
    if (total === arrLength) {
      callback(results);
    }
  }

  arr.forEach(a => {
    func(a, count);
  });
}
/**
 * 检查给定的类型是否为原生字符串类型
 * 
 * 此函数旨在验证输入的类型是否属于一组特定的原生字符串类型，这些类型包括：
 * - 'string'：通用字符串类型
 * - 'url'：表示URL的字符串类型
 * - 'hex'：表示十六进制颜色值的字符串类型
 * - 'email'：表示电子邮件地址的字符串类型
 * - 'date'：表示日期的字符串类型
 * - 'pattern'：表示正则表达式的字符串类型
 * 
 * @param type 要检查的字符串类型
 * @returns 如果给定类型是上述原生字符串类型之一，则返回true；否则返回false
 */
function asyncSerialArray(
  arr: RuleValuePackage[],
  func: ValidateFunc,
  callback: (errors: ValidateError[]) => void,
) {
  let index = 0;
  const arrLength = arr.length;

  function next(errors: ValidateError[]) {
    if (errors && errors.length) {
      callback(errors);
      return;
    }
    const original = index;
    index = index + 1;
    if (original < arrLength) {
      func(arr[original], next);
    } else {
      callback([]);
    }
  }

  next([]);
}
/**
 * 将对象的数组值展平为一个数组
 * 该函数接收一个对象数组，其中每个属性的值是一个RuleValuePackage类型的数组
 * 它的主要作用是将这些嵌套的数组合并到一个单一的数组中
 * 
 * @param objArr 包含RuleValuePackage数组的记录对象每个属性的值可以是RuleValuePackage的数组或null
 * @returns 返回一个合并后的RuleValuePackage数组
 */
function flattenObjArr(objArr: Record<string, RuleValuePackage[]>) {
  const ret: RuleValuePackage[] = [];
  Object.keys(objArr).forEach(k => {
    ret.push(...(objArr[k] || []));
  });
  return ret;
}

export class AsyncValidationError extends Error {
  errors: ValidateError[];
  fields: Record<string, ValidateError[]>;

  constructor(
    errors: ValidateError[],
    fields: Record<string, ValidateError[]>,
  ) {
    super('Async Validation Error');
    this.errors = errors;
    this.fields = fields;
  }
}

type ValidateFunc = (
  data: RuleValuePackage,
  doIt: (errors: ValidateError[]) => void,
) => void;
/**
 * 对象数组异步映射函数
 * 
 * 该函数用于对传入的对象数组中的每个元素应用给定的验证函数，并根据验证选项决定验证顺序
 * 如果选项中设置了first，表示对每个字段进行串行验证，一旦验证失败则停止后续验证
 * 如果选项中设置了firstFields，表示对指定的字段进行串行验证，其余字段并行验证
 * 如果未设置以上选项，则对所有字段进行并行验证
 * 
 * @param objArr 对象数组，键值对形式，每个键对应一组验证规则
 * @param option 验证选项，控制验证顺序和行为
 * @param func 验证函数，用于对每个字段进行验证
 * @param callback 回调函数，用于处理验证完成后的错误信息
 * @param source 原始数据源，通常为用户输入数据
 * @returns 返回一个Promise，用于异步处理验证过程，成功时返回原始数据源，失败时返回自定义错误信息
 */
export function asyncMap(
  objArr: Record<string, RuleValuePackage[]>,
  option: ValidateOption,
  func: ValidateFunc,
  callback: (errors: ValidateError[]) => void,
  source: Values,
): Promise<Values> {
  if (option.first) {
    const pending = new Promise<Values>((resolve, reject) => {
      const next = (errors: ValidateError[]) => {
        callback(errors);
        return errors.length
          ? reject(new AsyncValidationError(errors, convertFieldsError(errors)))
          : resolve(source);
      };
      const flattenArr = flattenObjArr(objArr);
      asyncSerialArray(flattenArr, func, next);
    });
    pending.catch(e => e);
    return pending;
  }
  const firstFields =
    option.firstFields === true
      ? Object.keys(objArr)
      : option.firstFields || [];

  const objArrKeys = Object.keys(objArr);
  const objArrLength = objArrKeys.length;
  let total = 0;
  const results: ValidateError[] = [];
  const pending = new Promise<Values>((resolve, reject) => {
    const next = (errors: ValidateError[]) => {
      results.push.apply(results, errors);
      total++;
      if (total === objArrLength) {
        callback(results);
        return results.length
          ? reject(
              new AsyncValidationError(results, convertFieldsError(results)),
            )
          : resolve(source);
      }
    };
    if (!objArrKeys.length) {
      callback(results);
      resolve(source);
    }
    objArrKeys.forEach(key => {
      const arr = objArr[key];
      if (firstFields.indexOf(key) !== -1) {
        asyncSerialArray(arr, func, next);
      } else {
        asyncParallelArray(arr, func, next);
      }
    });
  });
  pending.catch(e => e);
  return pending;
}
/**
 * 检查对象是否为错误对象
 * 
 * 此函数的目的是确定传入的参数是否符合`ValidateError`类型，该类型用于表示验证错误
 * 参数可以是字符串、函数或`ValidateError`对象，但我们的兴趣点在于区分出`ValidateError`类型
 * 
 * @param obj - 被检查的对象，可以是ValidateError类型、字符串或返回字符串的函数
 * @returns 返回布尔值，如果对象是`ValidateError`类型，则返回true，否则返回false
 * 
 * 注意：此函数通过检查对象的`message`属性是否定义来判断其是否为`ValidateError`类型
 * 这是因为`ValidateError`类型的对象预期有一个`message`属性，这是判断的依据
 */
function isErrorObj(
  obj: ValidateError | string | (() => string),
): obj is ValidateError {
  return !!(obj && (obj as ValidateError).message !== undefined);
}
/**
 * 获取嵌套对象中的值
 * 
 * 此函数旨在根据提供的路径数组，从一个初始值开始，逐步深入嵌套对象获取最终值
 * 它适用于那些可能部分路径不存在，导致结果为undefined的情况，增强了代码的健壮性
 * 
 * @param value 初始值，通常是一个对象，可以是嵌套的对象
 * @param path 一个字符串数组，代表了要从初始值中获取的路径
 * @returns 返回根据路径获取到的值，如果路径中任一环节为undefined，则返回undefined
 */
function getValue(value: Values, path: string[]) {
  let v = value;
  for (let i = 0; i < path.length; i++) {
    if (v == undefined) {
      return v;
    }
    v = v[path[i]];
  }
  return v;
}
/**
 * 补充错误信息的函数，用于在验证失败时完善错误详情
 * 
 * @param rule 内部规则项，包含了验证规则的详细信息
 * @param source 数据源，即待验证的数据集合
 * @returns 返回一个函数，该函数的参数是一个错误信息或生成错误信息的函数，返回一个完整的验证错误对象
 */
export function complementError(rule: InternalRuleItem, source: Values) {
  return (oe: ValidateError | (() => string) | string): ValidateError => {
    let fieldValue;
    if (rule.fullFields) {
      fieldValue = getValue(source, rule.fullFields);
    } else {
      fieldValue = source[(oe as any).field || rule.fullField];
    }
    if (isErrorObj(oe)) {
      oe.field = oe.field || rule.fullField;
      oe.fieldValue = fieldValue;
      return oe;
    }
    return {
      message: typeof oe === 'function' ? oe() : oe,
      fieldValue,
      field: ((oe as unknown) as ValidateError).field || rule.fullField,
    };
  };
}
/**
 * 深度合并两个对象
 * 
 * 本函数的目的是将源对象中的属性合并到目标对象中如果属性值是对象，则会进行深度合并，
 * 否则将直接覆盖原有值此操作是单向的，只会修改目标对象
 * 
 * @param target 目标对象，将被源对象的属性扩展
 * @param source 源对象，其属性将被合并到目标对象中可以是不完整的对象表示
 * @returns 返回合并后的新目标对象，与原始目标对象相同（实现深拷贝的效果）
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  if (source) {
    for (const s in source) {
      if (source.hasOwnProperty(s)) {
        const value = source[s];
        if (typeof value === 'object' && typeof target[s] === 'object') {
          target[s] = {
            ...target[s],
            ...value,
          };
        } else {
          target[s] = value;
        }
      }
    }
  }
  return target;
}
