import { Sweet, SweetFilters, CreateSweetRequest, UpdateSweetRequest, PurchaseRequest, RestockRequest } from '../types/sweet';

// Mock data for demonstration
const mockSweets: Sweet[] = [
  {
    id: '1',
    name: 'Chocolate Truffles',
    category: 'Chocolate',
    price: 2.50,
    quantity: 50,
    description: 'Rich, creamy chocolate truffles handcrafted with premium cocoa.'
  },
  {
    id: '2',
    name: 'Rainbow Gummy Bears',
    category: 'Gummies',
    price: 1.25,
    quantity: 100,
    description: 'Colorful fruit-flavored gummy bears loved by kids and adults.'
  },
  {
    id: '3',
    name: 'Vanilla Cupcakes',
    category: 'Pastries',
    price: 3.75,
    quantity: 25,
    description: 'Fluffy vanilla cupcakes topped with buttercream frosting.'
  },
  {
    id: '4',
    name: 'Strawberry Lollipops',
    category: 'Hard Candy',
    price: 0.75,
    quantity: 75,
    description: 'Sweet strawberry-flavored lollipops on a stick.'
  },
  {
    id: '5',
    name: 'Caramel Fudge',
    category: 'Fudge',
    price: 4.25,
    quantity: 30,
    description: 'Smooth caramel fudge squares made with real butter.'
  },
  {
    id: '6',
    name: 'Cotton Candy',
    category: 'Specialty',
    price: 2.00,
    quantity: 0,
    description: 'Light and fluffy cotton candy in various flavors.'
  }
];

let sweets = [...mockSweets];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sweetApi = {
  async getAllSweets(): Promise<Sweet[]> {
    await delay(500);
    return [...sweets];
  },

  async searchSweets(filters: SweetFilters): Promise<Sweet[]> {
    await delay(300);
    
    return sweets.filter(sweet => {
      if (filters.name && !sweet.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.category && !sweet.category.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
      if (filters.minPrice && sweet.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && sweet.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  },

  async createSweet(data: CreateSweetRequest): Promise<Sweet> {
    await delay(500);
    
    const newSweet: Sweet = {
      id: Date.now().toString(),
      ...data
    };
    
    sweets.push(newSweet);
    return newSweet;
  },

  async updateSweet(data: UpdateSweetRequest): Promise<Sweet> {
    await delay(500);
    
    const index = sweets.findIndex(s => s.id === data.id);
    if (index === -1) {
      throw new Error('Sweet not found');
    }
    
    sweets[index] = { ...sweets[index], ...data };
    return sweets[index];
  },

  async deleteSweet(id: string): Promise<void> {
    await delay(500);
    
    const index = sweets.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Sweet not found');
    }
    
    sweets.splice(index, 1);
  },

  async purchaseSweet(id: string, data: PurchaseRequest): Promise<Sweet> {
    await delay(500);
    
    const sweet = sweets.find(s => s.id === id);
    if (!sweet) {
      throw new Error('Sweet not found');
    }
    
    if (sweet.quantity < data.quantity) {
      throw new Error('Insufficient stock');
    }
    
    sweet.quantity -= data.quantity;
    return sweet;
  },

  async restockSweet(id: string, data: RestockRequest): Promise<Sweet> {
    await delay(500);
    
    const sweet = sweets.find(s => s.id === id);
    if (!sweet) {
      throw new Error('Sweet not found');
    }
    
    sweet.quantity += data.quantity;
    return sweet;
  }
};