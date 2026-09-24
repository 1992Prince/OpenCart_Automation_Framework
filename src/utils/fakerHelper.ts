import { faker } from '@faker-js/faker';

export class FakerHelper {

    // method return js obj
    static generateCustomer() {

        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            pincode: faker.location.zipCode()
        };
    }
}
