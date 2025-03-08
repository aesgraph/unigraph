abstract class BaseEntity {
  protected constructor() {}

  public deepCopy<T extends BaseEntity>(): T {
    // Create a new instance of the specific class type
    const constructor = Object.getPrototypeOf(this).constructor;
    const clone = new constructor();

    // Get all property names, including inherited ones
    const propertyNames = Object.getOwnPropertyNames(this);

    // Copy each property
    for (const prop of propertyNames) {
      const value = this[prop as keyof this];

      if (value === null || value === undefined) {
        clone[prop] = value;
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        clone[prop] = value.map((item) =>
          item instanceof BaseEntity
            ? item.deepCopy()
            : this.deepCopyValue(item)
        );
      }
      // Handle nested objects that are instances of BaseEntity
      else if (value instanceof BaseEntity) {
        clone[prop] = value.deepCopy();
      }
      // Handle Date objects
      else if (value instanceof Date) {
        clone[prop] = new Date(value);
      }
      // Handle plain objects
      else if (typeof value === "object") {
        clone[prop] = this.deepCopyValue(value);
      }
      // Handle primitive values
      else {
        clone[prop] = value;
      }
    }

    return clone as T;
  }

  private deepCopyValue(value: any): any {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepCopyValue(item));
    }

    if (value instanceof Date) {
      return new Date(value);
    }

    const copy: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        copy[key] = this.deepCopyValue(value[key]);
      }
    }
    return copy;
  }
}

// Example usage with inherited classes
class Person extends BaseEntity {
  constructor(
    public name: string,
    public age: number,
    public birthDate: Date,
    public addresses: Address[]
  ) {
    super();
  }
}

class Address extends BaseEntity {
  constructor(
    public street: string,
    public city: string,
    public country: string
  ) {
    super();
  }
}

// Example usage:
const address1 = new Address("123 Main St", "Boston", "USA");
const address2 = new Address("456 Side St", "New York", "USA");

const person = new Person("John Doe", 30, new Date("1994-01-01"), [
  address1,
  address2,
]);

// Create a deep copy
const personCopy = person.deepCopy<Person>();

// Verify the copy is independent
personCopy.name = "Jane Doe";
personCopy.addresses[0].street = "789 New St";

console.log(person.name); // "John Doe"
console.log(person.addresses[0].street); // "123 Main St"
console.log(personCopy.name); // "Jane Doe"
console.log(personCopy.addresses[0].street); // "789 New St"
