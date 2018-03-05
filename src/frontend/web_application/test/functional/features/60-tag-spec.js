const { signin, showSettings } = require('../utils/user-util');
const { switchApp, home } = require('../utils/navigation');

describe('tag', () => {
  const EC = protractor.ExpectedConditions;
  const locale = 'en';
  const __ = key => ({
    en: {},
  }[locale][key] || key);

  const subject = "It's okay, Bender. I like cooking too";

  beforeEach(() => {
    signin();
  });

  it('manage tags on timeline', () => {
    const tagName = 'Mon tag';
    home()
      .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000))
      .then(() => {
        const messageElement = element(by.cssContainingText('.s-message-item', 'Shut up and take my money! Leela'));

        return messageElement.element(by.css('.s-message-item__col-select input[type=checkbox]')).click()
          .then(() => element(by.css('.m-message-selector__actions .m-button[aria-label="Manage tags"]')).click())
          .then(() => expect(element(by.cssContainingText('.m-modal', __('Tags'))).isPresent()).toEqual(true))
          .then(() => expect(element.all(by.css('.m-tags-form__section .m-tag-item')).count()).toEqual(2));
      })
      .then(() => browser.element(by.css('.m-tags-form .m-input-text')).sendKeys('am'))
      .then(() => browser.element(by.cssContainingText('.m-tags-form__found-tag', __('Amphibians'))).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Amphibians')))), 5 * 1000))
      .then(() => browser.element(by.css('.m-tags-form .m-input-text')).sendKeys(tagName))
      .then(() => browser.element(by.css(`.m-tags-search__button[aria-label=${__('Add')}]`)).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName))), 5 * 1000))
      .then(() => element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Inbox'))).element(by.css(`[aria-label="${__('Remove')}"]`)).click())
      .then(() => expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Inbox'))).isPresent()).toEqual(false))
      .then(() => browser.sleep(1))
      .then(() => element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).element(by.css(`[aria-label="${__('Remove')}"]`)).click())
      .then(() => browser.sleep(1))
      .then(() => expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).isPresent()).toEqual(false))
    ;
  });

  it('manage tags for multiple messages on timeline', () => {
    const tagName = 'Mon tag';
    home()
      .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000))
      .then(() => {
        const messageElement1 = element(by.cssContainingText('.s-message-item', 'zoidberg'));
        const messageElement2 = element(by.cssContainingText('.s-message-item', 'Fry! Stay back!'));

        return messageElement1.element(by.css('.s-message-item__col-select input[type=checkbox]')).click()
          .then(() => messageElement2.element(by.css('.s-message-item__col-select input[type=checkbox]')).click())
          .then(() => element(by.css('.m-message-selector__actions .m-button[aria-label="Manage tags"]')).click())
          .then(() => expect(element(by.cssContainingText('.m-modal', __('Tags'))).isPresent()).toEqual(true))
          .then(() => expect(element.all(by.css('.m-tags-form__section .m-tag-item')).count()).toEqual(1));
      })
      .then(() => browser.element(by.css('.m-tags-form .m-input-text')).sendKeys('in'))
      .then(() => browser.element(by.cssContainingText('.m-tags-form__found-tag', __('Inbox'))).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Inbox')))), 5 * 1000))
      .then(() => browser.element(by.css('.m-tags-form .m-input-text')).sendKeys(tagName))
      .then(() => browser.element(by.css(`.m-tags-search__button[aria-label=${__('Add')}]`)).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName))), 5 * 1000))
      .then(() => element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Inbox'))).element(by.css(`[aria-label="${__('Remove')}"]`)).click())
      .then(() => expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', __('Inbox'))).isPresent()).toEqual(false))
      .then(() => browser.sleep(1))
      .then(() => element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).element(by.css(`[aria-label="${__('Remove')}"]`)).click())
      .then(() => browser.sleep(1))
      .then(() => expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).isPresent()).toEqual(false))
    ;
  });

  it('manage tags on a message of a discussion', () => {
    browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000)
      .then(() => element(by.cssContainingText('.s-timeline .s-message-item .s-message-item__topic .s-message-item__subject', subject)).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-message__container', 'zoidberg@planet-express.tld'))), 5 * 1000))
      .then(() => element(by.cssContainingText('.m-message__container', 'zoidberg@planet-express.tld')).element(by.css('.m-message__actions-switcher')).click())
      .then(() => element(by.cssContainingText('.m-message-actions-container__action', __('Tags'))).click())
      .then(() => expect(element(by.cssContainingText('.m-modal', __('Tags'))).isPresent()).toEqual(true));
  });

  it('manage tags on a contact', () => {
    switchApp('Contacts')
      .then(() => browser.wait(EC.presenceOf($('.m-contact-list__contact')), 5 * 1000))
      .then(() => element(by.cssContainingText('.m-contact-list__contact', 'Bender Bending Rodriguez')).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-contact-profile__name', 'Bender Bending Rodriguez'))), 5 * 1000))
      .then(() => element(by.css('.s-contact__actions-switcher')).click())
      .then(() => element(by.cssContainingText('.s-contact__action', __('Edit tags'))).click())
      .then(() => expect(element(by.cssContainingText('.m-modal', __('Tags'))).isPresent()).toEqual(true));
  });

  describe('manage tags in settings', () => {
    it('add and remove a new tag', () => {
      const tagName = 'Mon nouveau tag';
      showSettings('Tags')
        .then(() => browser.wait(EC.presenceOf($('.m-add-tag .m-input-text')), 5 * 1000))
        .then(() => element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName))
        .then(() => element(by.css(`.m-add-tag__button[aria-label=${__('Add')}]`)).click())
        .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName))), 5 * 1000))
        .then(() => element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).element(by.css('.m-tag-input__delete')).click())
        .then(() => browser.sleep(1))
        .then(() => expect(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).isPresent()).toEqual(false))
      ;
    });

    it('should not allow to create a tag that already exist', () => {
      const tagName = 'my_tag';
      showSettings('Tags')
        .then(() => browser.wait(EC.presenceOf($('.m-add-tag .m-input-text')), 5 * 1000))
        .then(() => element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName))
        .then(() => element(by.css(`.m-add-tag__button[aria-label=${__('Add')}]`)).click())
        .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName))), 5 * 1000))
        .then(() => element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName))
        .then(() => element(by.css(`.m-add-tag__button[aria-label=${__('Add')}]`)).click())
        .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.m-field-errors', 'Unable to create the tag. A tag with the same id may already exist.'))), 5 * 1000))
        // FIXME: do not click on floating action button instead of delete
        .then(() => browser.executeScript('window.scrollTo(0, document.body.scrollHeight);'))
        // ---
        .then(() => element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).element(by.css('.m-tag-input__delete')).click())
        .then(() => browser.sleep(1))
        .then(() => expect(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).isPresent()).toEqual(false))
      ;
    });

    it('rename a tag', () => {
      const tagName = 'Edited ';
      showSettings('Tags')
        .then(() => browser.wait(EC.presenceOf($('.m-add-tag .m-input-text')), 5 * 1000))
        .then(() => element(by.cssContainingText('.s-tags-settings__tags .m-tag-input .m-tag-input__button', __('Inbox'))).click())
        .then(() => element(by.css('.m-tag-input__input .m-input-text')).sendKeys(tagName))
        .then(() => element(by.css('.m-tag-input .m-button[aria-label=Save]')).click())
        .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input .m-tag-input__button', 'Edited Inbox')), 5 * 1000)))
      ;
    });
  });
});
