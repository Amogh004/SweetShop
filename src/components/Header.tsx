import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingBag, LogOut, User, Crown } from 'lucide-react';
import logo from '../assets/logo.png';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sweet Shop" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-candy bg-clip-text text-transparent">
                Sweet Shop
              </h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <Crown className="w-4 h-4 text-warning" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{user.username}</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};