import { UniquePage } from './app.po';

describe('unique App', () => {
  let page: UniquePage;

  beforeEach(() => {
    page = new UniquePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
