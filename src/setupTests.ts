import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'raf/polyfill';
// eslint-disable-next-line import/no-internal-modules
import '@testing-library/jest-dom/extend-expect';
require('jest-fetch-mock').enableMocks();

Enzyme.configure({ adapter: new Adapter() });
