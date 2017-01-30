import Steamer from '../../src/steamer';

describe('Steamer', () => {
  describe('Construction', () => {
    it('should throw if no file name is given', () => {
      expect(() => new Steamer(null, {})).to.throw(Error);
    });

    it('should throw if no callbacks are given', () => {
      expect(() => new Steamer('dummy', null)).to.throw(Error);
    });
  });
});
