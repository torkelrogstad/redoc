import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'raf/polyfill';
import '@testing-library/jest-dom';
require('jest-fetch-mock').enableMocks();

Enzyme.configure({ adapter: new Adapter() });
