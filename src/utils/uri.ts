import { OperationModel } from '../services';

/*
 * If we have a url like foo/bar/{uuid} uuid will be replaced with what user has typed in.
 */
export const addParamsToUrl = (operation: OperationModel, urlIndex: number): URL => {
  let url = operation.servers[urlIndex].url + operation.path;

  const queryParams: { [key: string]: string } = {};
  for (const fieldModel of operation.parameters) {
    if (fieldModel.in === 'path') {
      if (url.indexOf(`{${fieldModel.name}}`) > -1 && fieldModel.$value.length > 0) {
        url = url.replace(`{${fieldModel.name}}`, fieldModel.$value);
      }
    }
    if (fieldModel.in === 'query') {
      queryParams[fieldModel.name] = fieldModel.$value;
    }
  }
  const parsed = new URL(url);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === '') {
      return;
    }
    parsed.searchParams.append(key, value);
  });

  return parsed;
};

export const getMissingParameters = (url: URL) =>
  Array.from(decodeURIComponent(url.pathname).matchAll(/{(.*?)}/gm)).map(match => match[1]);
