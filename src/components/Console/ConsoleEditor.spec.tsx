import * as React from 'react';
import * as rtl from '@testing-library/react';

import { findOperation, getSpec, getAceEditor } from './ConsoleTestUtil';
import { ConsoleEditor } from './ConsoleEditor';
import { RedocNormalizedOptions } from '../../services';
import { ThemeProvider } from '../../styled-components';

test('only renders the value for the default example', async () => {
  const options = new RedocNormalizedOptions({});
  const spec = getSpec('teslacoil.swagger.json');
  const operation = findOperation('CreateLightningInvoice', spec);
  const mediaTypes = operation.requestBody?.content?.mediaTypes;
  expect(mediaTypes).toHaveLength(1);

  const utils = rtl.render(
    <ThemeProvider theme={options.theme}>
      <ConsoleEditor mediaTypes={mediaTypes!}></ConsoleEditor>
    </ThemeProvider>,
  );
  expect(JSON.parse(getAceEditor(utils).getValue())).toEqual({
    amount: 0,
    callback_url: 'string',
    client_id: 'string',
    currency: 'BTC',
    description: 'string',
    exchange_currency: 'BTC',
    expiry_seconds: 0,
    lightning_memo: 'string',
  });
});
