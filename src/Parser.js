import {
  tokenize,
} from './tokenizer';

export default class Parser {
  constructor(expressionString) {
    this.expressionString = expressionString;
    this.tokens = tokenize(this.expressionString);
    this.currentIndex = 0;

    // fn(parser, leftToken) returns expression
    this.prefixParseFns = new Map();
    // fn(parser, leftExpression, rightToken) returns expression
    this.infixParseFns = new Map();
    // maps token type to precendence
    this.tokenTypeToPrecedence = new Map();
  }

  // returns the next token
  consume() {
    if (this.currentIndex >= this.tokens.length) {
      throw new Error('Cannot consume. Index exceeds tokens length.');
    }
    const token = this.tokens[this.currentIndex];
    this.currentIndex += 1;
    return token;
  }

  // returns the upcoming token n spots ahead. lookAhead(1) returns the next token.
  lookAhead(n) {
    const i = this.currentIndex + n;
    if (i > this.tokens.length) {
      throw new Error('LookAhead is beyond the end of tokens');
    }
    return this.tokens[i];
  }

  peekPrecedence() {
    const token = this.lookAhead(0);
    const precedence = this.tokenTypeToPrecedence.get(token.type);
    return precedence || 0;
  }

  parseExpression(precedence = 0) {
    const leftToken = this.consume();
    const prefixParseFn = this.prefixParseFns.get(leftToken.type);

    if (!prefixParseFn) {
      throw new TypeError(`Could not parse token of type: ${leftToken.type.toString()}`);
    }

    let leftExpression = prefixParseFn(this, leftToken);

    while (precedence < this.peekPrecedence()) {
      const rightToken = this.consume();
      const infixParseFn = this.infixParseFns.get(rightToken.type);

      leftExpression = infixParseFn(this, leftExpression, rightToken);
    }

    return leftExpression;
  }
}
