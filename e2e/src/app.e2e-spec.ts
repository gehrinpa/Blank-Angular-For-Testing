import { GeekTalentInsightsAppPage } from './app.po';

describe('blank-angular-for-testing App', function() {
  let page: GeekTalentInsightsAppPage;

  beforeEach(() => {
    page = new GeekTalentInsightsAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    // expect(page.getParagraphText()).toEqual('app works!');
  });
});
