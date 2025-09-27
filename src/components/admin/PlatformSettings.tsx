
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getProSubscriptionPrice, updateProSubscriptionPrice } from '@/services/settingsService';
import { toast } from 'sonner';

const PlatformSettings = () => {
  const [price, setPrice] = useState<number>(2500);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProSubscriptionPrice()
      .then((val) => setPrice(Number(val) || 2500))
      .catch(() => toast.error('Failed to fetch subscription price'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProSubscriptionPrice(price);
      toast.success('Subscription price updated');
    } catch (e) {
      toast.error('Failed to update subscription price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Platform Name</label>
            <Input defaultValue="PrimeChances" disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Max Free Applications</label>
            <Input type="number" defaultValue="10" disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Pro Subscription Price (NGN)</label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              disabled={loading || saving}
            />
          </div>
          <Button
            className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSettings;
