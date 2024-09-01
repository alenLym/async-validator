// >>>>> Rule
// Modified from https://github.com/yiminghe/async-validator/blob/0d51d60086a127b21db76f44dff28ae18c165c47/src/index.d.ts
export type RuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'method'
  | 'regexp'
  | 'integer'
  | 'float'
  | 'array'
  | 'object'
  | 'enum'
  | 'date'
  | 'url'
  | 'hex'
  | 'email'
  | 'pattern'
  | 'any';

/* 提供的 TypeScript 代码中的 'export interface ValidateOption' 定义了一组选项
可以在验证过程中使用。这些选项包括：*/
export interface ValidateOption {
  // 是否禁止显示内部警告
  suppressWarning?: boolean;

  // 是否抑制验证人错误
  suppressValidatorError?: boolean;

  // 当第一个验证规则生成 Error Stop Processed 时
  first?: boolean;

  // 当指定字段的第一个验证规则生成 Error Stop the Field processed 时，“true”表示所有字段。
  firstFields?: boolean | string[];

  messages?: Partial<ValidateMessages>;

  /** 规则的名称需要为 trigger。如果留空，将验证所有规则*/
  keys?: string[];

  error?: (rule: InternalRuleItem, message: string) => ValidateError;
}

export type SyncErrorType = Error | string;
export type SyncValidateResult = boolean | SyncErrorType | SyncErrorType[];
export type ValidateResult = void | Promise<void> | SyncValidateResult;

/* 'export interface RuleItem {' 在 TypeScript 中定义一个接口，该接口表示
验证规则项。此接口指定了可用于定义
字段的验证规则。'RuleItem' 接口中包含的一些属性包括：*/
export interface RuleItem {
  type?: RuleType; // default type is 'string'
  required?: boolean;
  pattern?: RegExp | string;
  min?: number; // Range of type 'string' and 'array'
  max?: number; // Range of type 'string' and 'array'
  len?: number; // Length of type 'string' and 'array'
  enum?: Array<string | number | boolean | null | undefined>; // possible values of type 'enum'
  whitespace?: boolean;
  fields?: Record<string, Rule>; // ignore when without required
  options?: ValidateOption;
  defaultField?: Rule; // 'object' or 'array' containing validation rules
  transform?: (value: Value) => Value;
  message?: string | ((a?: string) => string);
  asyncValidator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption,
  ) => void | Promise<void>;
  validator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption,
  ) => SyncValidateResult | void;
}

export type Rule = RuleItem | RuleItem[];

export type Rules = Record<string, Rule>;

/**
 *  用于验证值的规则存在于可枚举列表中。
 *
 *  @param rule 验证规则。
 *  @param值 源对象上的字段值。
 *  @param source 正在验证的源对象。
 *  @param 错误 此规则可能添加的错误数组
 *  验证错误到。
 *  @param 选项 验证选项。
 *  @param options.messages 验证消息。
 *  @param类型 规则类型
 */
export type ExecuteRule = (
  rule: InternalRuleItem,
  value: Value,
  source: Values,
  errors: string[],
  options: ValidateOption,
  type?: string,
) => void;

/**
 *  对任何类型的执行验证。
 *
 *  @param rule 验证规则。
 *  @param值 源对象上的字段值。
 *  @param callback 回调函数。
 *  @param source 正在验证的源对象。
 *  @param 选项 验证选项。
 *  @param options.messages 验证消息。
 */
export type ExecuteValidator = (
  rule: InternalRuleItem,
  value: Value,
  callback: (error?: string[]) => void,
  source: Values,
  options: ValidateOption,
) => void;

// >>>>> Message
type ValidateMessage<T extends any[] = unknown[]> =
  | string
  | ((...args: T) => string);
type FullField = string | undefined;
type EnumString = string | undefined;
type Pattern = string | RegExp | undefined;
type Range = number | undefined;
type Type = string | undefined;

/* “export interface ValidateMessages {”在 TypeScript 中定义一个接口，该接口指定
可在验证过程中使用的验证消息的结构。此接口包括
各种消息类型，如默认消息、必填字段消息、枚举消息、空格
消息， 特定于类型的消息 （string， method， array， object， number， date， boolean， integer，
float、regexp、email、url、hex）、特定于字符串的消息（len、min、max、range）、特定于数字的消息
消息（len、min、max、range）、数组特定的消息（len、min、max、range）和
特定于模式的消息 （mismatch）。*/
export interface ValidateMessages {
  default?: ValidateMessage;
  required?: ValidateMessage<[FullField]>;
  enum?: ValidateMessage<[FullField, EnumString]>;
  whitespace?: ValidateMessage<[FullField]>;
  date?: {
    format?: ValidateMessage;
    parse?: ValidateMessage;
    invalid?: ValidateMessage;
  };
  types?: {
    string?: ValidateMessage<[FullField, Type]>;
    method?: ValidateMessage<[FullField, Type]>;
    array?: ValidateMessage<[FullField, Type]>;
    object?: ValidateMessage<[FullField, Type]>;
    number?: ValidateMessage<[FullField, Type]>;
    date?: ValidateMessage<[FullField, Type]>;
    boolean?: ValidateMessage<[FullField, Type]>;
    integer?: ValidateMessage<[FullField, Type]>;
    float?: ValidateMessage<[FullField, Type]>;
    regexp?: ValidateMessage<[FullField, Type]>;
    email?: ValidateMessage<[FullField, Type]>;
    url?: ValidateMessage<[FullField, Type]>;
    hex?: ValidateMessage<[FullField, Type]>;
  };
  string?: {
    len?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  number?: {
    len?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  array?: {
    len?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  pattern?: {
    mismatch?: ValidateMessage<[FullField, Value, Pattern]>;
  };
}

/* 行 'export interface InternalValidateMessages extends ValidateMessages {' 正在创建一个新的
名为 'InternalValidateMessages' 的接口，该接口扩展了 'ValidateMessages' 接口。由
扩展 'ValidateMessages'，'InternalValidateMessages' 接口继承所有属性
和 'ValidateMessages' 中定义的类型，同时还允许您添加其他属性或
特定于 'InternalValidateMessages' 的方法。*/
export interface InternalValidateMessages extends ValidateMessages {
  clone: () => InternalValidateMessages;
}

// >>>>> Values
export type Value = any;
export type Values = Record<string, Value>;

// >>>>>验证
/* “export interface ValidateError”定义了一个 TypeScript 接口来表示错误
这可能发生在验证过程中。此接口包括以下属性：*/
export interface ValidateError {
  message?: string;
  fieldValue?: Value;
  field?: string;
}

export type ValidateFieldsError = Record<string, ValidateError[]>;

export type ValidateCallback = (
  errors: ValidateError[] | null,
  fields: ValidateFieldsError | Values,
) => void;

/* 'RuleValuePackage' 接口定义了一个结构，该结构将必要的
用于验证特定字段的信息。它包括以下属性：*/
export interface RuleValuePackage {
  rule: InternalRuleItem;
  value: Value;
  source: Values;
  field: string;
}

/* 行 'export interface InternalRuleItem extends Omit<RuleItem， 'validator'> {' 定义了一个新的
名为 'InternalRuleItem' 的接口，扩展了 'RuleItem' 接口，但省略了 'validator'
属性。这意味着 'InternalRuleItem' 将具有
'RuleItem' （'validator' 属性除外）。*/
export interface InternalRuleItem extends Omit<RuleItem, 'validator'> {
  field?: string;
  fullField?: string;
  fullFields?: string[];
  validator?: RuleItem['validator'] | ExecuteValidator;
}
