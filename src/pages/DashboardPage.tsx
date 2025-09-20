import React, { useState, useEffect } from 'react';
import { Sweet, SweetFilters } from '../types/sweet';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { SweetCard } from '../components/SweetCard';
import { AdminPanel } from '../components/AdminPanel';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';
import { sweetApi } from '../api/sweetApi';
import { toast } from '../hooks/use-toast';
import heroImage from '../assets/hero-banner.jpg';

const categories = ['All', 'Chocolate', 'Gummies', 'Hard Candy', 'Pastries', 'Fudge', 'Specialty'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [filters, setFilters] = useState<SweetFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadSweets = async () => {
    try {
      setIsLoading(true);
      const data = await sweetApi.getAllSweets();
      setSweets(data);
      setFilteredSweets(data);
    } catch (error) {
      toast({
        title: "Failed to load sweets",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...sweets];

    if (searchTerm) {
      filtered = filtered.filter(sweet =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sweet.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(sweet => sweet.category === selectedCategory);
    }

    setFilteredSweets(filtered);
  }, [sweets, searchTerm, selectedCategory]);

  const handleSearch = async () => {
    if (!searchTerm && selectedCategory === 'All') {
      setFilteredSweets(sweets);
      return;
    }

    const searchFilters: SweetFilters = {};
    
    if (searchTerm) {
      searchFilters.name = searchTerm;
    }
    
    if (selectedCategory !== 'All') {
      searchFilters.category = selectedCategory;
    }

    try {
      setIsLoading(true);
      const results = await sweetApi.searchSweets(searchFilters);
      setFilteredSweets(results);
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setFilteredSweets(sweets);
  };

  const getTotalValue = () => {
    return sweets.reduce((total, sweet) => total + (sweet.price * sweet.quantity), 0);
  };

  const getOutOfStockCount = () => {
    return sweets.filter(sweet => sweet.quantity === 0).length;
  };

  const getLowStockCount = () => {
    return sweets.filter(sweet => sweet.quantity > 0 && sweet.quantity <= 10).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Sweet Shop Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2 animate-bounce-gentle">
              Welcome to Sweet Shop
            </h1>
            <p className="text-lg opacity-90">
              Discover our delicious collection of handcrafted sweets
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{sweets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success font-bold">$</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${getTotalValue().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <span className="text-warning font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{getLowStockCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-destructive font-bold">×</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{getOutOfStockCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel */}
        {user?.role === 'admin' && (
          <AdminPanel 
            onUpdate={loadSweets} 
            selectedSweet={selectedSweet}
            onClearSelection={() => setSelectedSweet(null)}
          />
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sweets by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
            
            {(searchTerm || selectedCategory !== 'All') && (
              <div className="flex gap-2 mt-4">
                {searchTerm && (
                  <Badge variant="outline">Search: {searchTerm}</Badge>
                )}
                {selectedCategory !== 'All' && (
                  <Badge variant="outline">Category: {selectedCategory}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sweet Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredSweets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No sweets found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filters'
                  : 'No sweets available at the moment'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onUpdate={loadSweets}
                onEdit={setSelectedSweet}
                onDelete={async (id) => {
                  try {
                    await sweetApi.deleteSweet(id);
                    toast({
                      title: "Sweet deleted",
                      description: "The sweet has been removed from inventory.",
                    });
                    loadSweets();
                  } catch (error) {
                    toast({
                      title: "Failed to delete sweet",
                      description: error instanceof Error ? error.message : "Unknown error occurred",
                      variant: "destructive",
                    });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};