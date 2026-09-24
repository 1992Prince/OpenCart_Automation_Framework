import {test} from '@playwright/test'
import {FakerHelper} from '../../src/utils/fakerHelper'


test('faker test demo', () => {

    console.log(FakerHelper.generateCustomer());
    console.log();
    console.log(FakerHelper.generateCustomer().firstName," ",FakerHelper.generateCustomer().email);
    console.log(FakerHelper.generateCustomer().lastName," ",FakerHelper.generateCustomer().phone);
})