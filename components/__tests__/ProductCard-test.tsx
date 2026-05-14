import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import ProductCard from '../ProductCard';

// Mock expo-router to track navigation calls
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('<ProductCard />', () => {
  const mockProduct = {
    id: 'p123',
    title: 'Modern Stylish Watch',
    price: 250,
    image: 'https://example.com/watch.jpg',
  };

  it('renders product title and price correctly', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    
    // Check if the title is rendered
    expect(getByText('Modern Stylish Watch')).toBeTruthy();
    
    // Check if the price is rendered with the currency symbol
    expect(getByText('₪250')).toBeTruthy();
  });

  it('navigates to the product details page when the button is pressed', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    
    // Find the "View Details" button by its Arabic text
    const detailsButton = getByText('عرض التفاصيل');
    
    // Simulate a press event
    fireEvent.press(detailsButton);
    
    // Verify that router.push was called with the correct path
    expect(router.push).toHaveBeenCalledWith('/productdetails/p123');
  });

  it('renders with individual props if product object is not provided', () => {
    const { getByText } = render(
      <ProductCard 
        id="p456" 
        title="Minimalist Wallet" 
        price={45} 
        image="https://example.com/wallet.jpg" 
      />
    );
    
    expect(getByText('Minimalist Wallet')).toBeTruthy();
    expect(getByText('₪45')).toBeTruthy();
  });
});
