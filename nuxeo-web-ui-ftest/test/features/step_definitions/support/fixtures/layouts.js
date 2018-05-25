import { FieldRegistry } from '../services/field_registry';
import path from 'path';

global.fieldRegistry = new FieldRegistry();
const suggestionGet = (element) => {
  if (element.getAttribute('multiple')) {
    return element.elements('.selectivity-multiple-selected-item')
        .value.map((v) => v.getText()).join(',');
  } else {
    return element.element('.selectivity-single-selected-item').getText();
  }
};
const suggestionSet = (element, value) => {
  const isMulti = element.getAttribute('multiple');
  const values = isMulti ? value.split(',') : [value];
  element.scrollIntoView(`#input`);
  for (let i = 0; i < values.length; i++) {
    element.waitForVisible(isMulti ? `input` : `#input`);
    element.element(isMulti ? `input` : `#input`).click();
    element.waitForVisible(isMulti ? `.selectivity-multiple-input` : `.selectivity-search-input`);
    element.element(isMulti ? `.selectivity-multiple-input` : `.selectivity-search-input`).setValue(values[i]);
    element.waitForVisible(`.selectivity-result-item.highlight`);
    element.click(`.selectivity-result-item.highlight`);
  }
};
global.fieldRegistry.register('nuxeo-input',
                              (element) => element.element('#nativeInput').getValue(),
                              (element, value) => { element.element('#nativeInput').setValue(value); });
global.fieldRegistry.register('nuxeo-select',
                              (element) => {
                                element.element('#input').getValue();
                              },
                              (element, value) => {
                                element.element('#input').click();
                                element.waitForExist('paper-item');
                                const item = element.elementByTextContent('paper-item', value);
                                item.waitForExist();
                                item.click();
                              });
global.fieldRegistry.register('nuxeo-date',
                              (element) => {
                                const date = moment(element.element('#datetime').getText(), global.dateFormat)
                                    .format(global.dateFormat);
                                return date;
                              },
                              () => {
                                throw new Error('cannot set value of a nuxeo-date element');
                              });
global.fieldRegistry.register('nuxeo-date-picker',
                              (element) => moment(element.element('vaadin-text-field').getValue(), global.dateFormat)
                                  .format(global.dateFormat),
                              (element, value) => {
                                element.element('vaadin-text-field').click();
                                const keys = moment(value, global.dateFormat).format('L');
                                driver.keys(keys);
                                driver.keys('Enter');
                              });
global.fieldRegistry.register('nuxeo-textarea',
                              (element) => element.element('#textarea').getValue(),
                              (element, value) => { element.element('#textarea').setValue(value); });
global.fieldRegistry.register('nuxeo-user-suggestion',
                              suggestionGet,
                              suggestionSet);
global.fieldRegistry.register('nuxeo-directory-suggestion',
                              suggestionGet,
                              suggestionSet);
global.fieldRegistry.register('nuxeo-document-suggestion',
                              suggestionGet,
                              suggestionSet);
global.fieldRegistry.register('nuxeo-dropdown-aggregation',
                              suggestionGet,
                              suggestionSet);
global.fieldRegistry.register('nuxeo-selectivity',
                              suggestionGet,
                              suggestionSet);
global.fieldRegistry.register('nuxeo-select2',
                              (element) => element.element('div ul li input').getValue(),
                              (element, value) => {
                                element.element('div ul li input').click();
                                driver.element('div ul li input').setValue(value);
                                driver.waitForVisible(`//div[text()='${value}' and @class='select2-result-label']`);
                                driver.element(`//div[text()='${value}' and @class='select2-result-label']`).click();
                              });
global.fieldRegistry.register('nuxeo-tag-suggestion',
                               suggestionGet,
                               suggestionSet);
global.fieldRegistry.register('paper-input',
                              (element) => element.element('#nativeInput').getValue(),
                              (element, value) => { element.element('#nativeInput').setValue(value); });
global.fieldRegistry.register('paper-radio-button',
                              (element) => element.element('#radioContainer').getAttribute('multiple'),
                              (element, value) => {
                                if (value) {
                                  element.element('#radioContainer').click();
                                }
                              });
global.fieldRegistry.register('paper-checkbox',
                              (element) => element.getAttribute('checked'),
                              (element, value) => {
                                if ((value === false && element.getAttribute('checked') === 'true') ||
                                  (value === true && element.getAttribute('checked') === 'null')) {
                                  element.click();
                                }
                              });
global.fieldRegistry.register('nuxeo-checkbox-aggregation',
                              (element) => element.element('paper-checkbox').getAttribute('aria-checked'),
                              (element, value) => {
                                element.waitForVisible('paper-checkbox');
                                const els = element.elements('paper-checkbox').value;
                                const el = els.find((e) => {
                                  const text = e.getText();
                                  return typeof text === 'string' && text.trim().includes(value);
                                });
                                el.click();
                              });
global.fieldRegistry.register('nuxeo-dropzone',
                              () => driver.element(`nuxeo-dropzone input[id='input']`).getValue(),
                              (element, value) => {
                                browser.waitForExist(`nuxeo-dropzone input[id='input']`);
                                browser.chooseFile(`nuxeo-dropzone input[id='input']`,
                                                   path.resolve(fixtures.blobs.get(value)));
                              });
global.fieldRegistry.register('nuxeo-data-table',
                              (element) => {
                                const result = [];
                                element.elements('nuxeo-data-table-row:not([header])').value.forEach(row => {
                                  const cellValue = [];
                                  row.elements('nuxeo-data-table-cell:not([header])').value.forEach(cell => {
                                    const txt = cell.getText();
                                    if (txt) {
                                      cellValue.push(txt);
                                    }
                                  });
                                  result.push(cellValue);
                                });
                                return JSON.stringify(result);
                              },
                              (element, values) => {
                                const jValues = JSON.parse(values);
                                jValues.forEach(value => {
                                  element.element('#addEntry').click();
                                  const dialog = element.element('nuxeo-dialog[id="dialog"]:not([aria-hidden])');
                                  dialog.waitForVisible();
                                  const form = element.element('#editForm');
                                  form.waitForVisible();
                                  for (const property in value) {
                                    if (value.hasOwnProperty(property)) {
                                      form.waitForVisible(`[name="${property}"]`);
                                      fixtures.layouts
                                        .setValue(form.element(`[name="${property}"]`), value[property]);
                                    }
                                  }
                                  dialog.waitForVisible(`paper-button[id="save"]`);
                                  dialog.click(`paper-button[id="save"]`);
                                });
                              });
global.fieldRegistry.register('generic',
                              (element) => element.getText(),
                              (element, value) => element.setValue(value));

fixtures.layouts = {
  getValue: (element) => {
    const fieldType = element.getTagName();
    return (global.fieldRegistry.contains(fieldType) ? global.fieldRegistry.getValFunc(fieldType) :
                                                       global.fieldRegistry.getValFunc('generic'))(element);
  },
  setValue: (element, value) => {
    const fieldType = element.getTagName();
    (global.fieldRegistry.contains(fieldType) ? global.fieldRegistry.setValFunc(fieldType) :
                                                global.fieldRegistry.setValFunc('generic'))(element, value);
  },
  page: {
    Note: 'nuxeo-document-page',
    File: 'nuxeo-document-page',
    Folder: 'nuxeo-collapsible-document-page',
    Workspace: 'nuxeo-collapsible-document-page',
    Collection: 'nuxeo-collapsible-document-page',
  },
};