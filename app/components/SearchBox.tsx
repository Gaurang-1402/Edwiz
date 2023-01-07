import React from 'react';
import { Form, Input, Button } from 'react-daisyui';

export const SearchBox = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Perform search with searchTerm
  };

  return (

    <Form onSubmit={handleSearch}>
      <Input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchTerm(e.target.value)} />
      <button className='ml-3 bg-gray-200' type="submit">Search</button>
    </Form>
  );
};

