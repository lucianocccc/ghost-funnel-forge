
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStrategicInsights } from '@/hooks/useStrategicInsights';
import { supabase } from '@/integrations/supabase/client';
import { PremiumTemplate } from '@/types/strategy';
import { Star, Download, Search, Filter, Crown } from 'lucide-react';

const PremiumMarketplace = () => {
  const { trackBehavior } = useStrategicInsights();
  const [templates, setTemplates] = useState<PremiumTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const categories = ['Landing Pages', 'E-commerce', 'Lead Generation', 'Webinars', 'SaaS', 'Consulting'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Marketing', 'Education'];

  const loadPremiumTemplates = async () => {
    try {
      setLoading(true);
      
      // Use secure function to get only safe preview data (no sensitive template content)
      const { data, error } = await supabase.rpc('get_premium_template_preview');
      
      if (error) {
        console.error('Error loading premium templates:', error);
        setTemplates([]);
        return;
      }

      // Filter by category and industry if selected
      let filteredData = data || [];
      
      if (selectedCategory) {
        filteredData = filteredData.filter((item: any) => item.category === selectedCategory);
      }

      if (selectedIndustry) {
        filteredData = filteredData.filter((item: any) => item.industry === selectedIndustry);
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter((item: any) => 
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      }

      // Transform data to match expected interface (safe preview data only)
      const transformedTemplates: PremiumTemplate[] = filteredData.map((item: any) => ({
        id: item.id,
        name: item.name || 'Unnamed Template',
        description: item.description,
        category: item.category || 'General',
        industry: item.industry,
        price: item.price || 0,
        is_premium: true,
        template_data: {}, // Empty for security - only available after purchase
        performance_metrics: {}, // Empty for security - only available after purchase
        sales_count: item.sales_count || 0,
        rating: item.rating || 0,
        created_by: '', // Hidden for security
        approved_at: item.approved_at,
        created_at: item.created_at,
        updated_at: null,
      }));

      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error loading premium templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (template: PremiumTemplate) => {
    trackBehavior('template_purchase_initiated', {
      template_id: template.id,
      template_name: template.name,
      price: template.price,
      category: template.category,
    });

    // Here you would integrate with your payment system
    console.log('Purchasing template:', template);
  };

  const handlePreview = (template: PremiumTemplate) => {
    trackBehavior('template_preview', {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
    });
  };

  useEffect(() => {
    loadPremiumTemplates();
    trackBehavior('premium_marketplace_visit');
  }, [selectedCategory, selectedIndustry, searchTerm]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Crown className="h-8 w-8 mr-3 text-yellow-500" />
            Premium Marketplace
          </h1>
          <p className="text-muted-foreground">
            High-converting templates from top performers
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
          Premium Collection
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedIndustry('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading premium templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{template.category}</Badge>
                      {template.industry && (
                        <Badge variant="outline">{template.industry}</Badge>
                      )}
                    </div>
                  </div>
                  {template.is_premium && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Sales</div>
                      <div className="font-medium">{template.sales_count}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="flex items-center">
                        {renderStars(Math.floor(template.rating))}
                        <span className="ml-1 font-medium">{template.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      ${template.price}
                      {template.price === 0 && (
                        <Badge variant="secondary" className="ml-2">Free</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                    >
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePurchase(template)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {template.price === 0 ? 'Download' : 'Purchase'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No premium templates found matching your criteria.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedIndustry('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PremiumMarketplace;
