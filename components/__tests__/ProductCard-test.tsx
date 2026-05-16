import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';
import ProductCard from '../ProductCard';

const pushMock = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: pushMock,
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
    
    expect(getByText('Modern Stylish Watch')).toBeTruthy();
    
    expect(getByText('₪250')).toBeTruthy();
  });

  it('navigates to the product details page when the button is pressed', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    
    const detailsButton = getByText('View details ');
    
    
    fireEvent.press(detailsButton);
    
    
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
