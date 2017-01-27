import steamer from '../../src/steamer';

describe('steamer', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(steamer, 'greet');
      steamer.greet();
    });

    it('should have been run once', () => {
      expect(steamer.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(steamer.greet).to.have.always.returned('hello');
    });
  });
});
