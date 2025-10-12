import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, Monitor, Smartphone, Tablet, Calendar, MapPin, ExternalLink } from "lucide-react";

interface Visitor {
  id: number;
  ip_address: string;
  page_visited: string;
  referrer: string;
  city: string;
  country: string;
  device_type: string;
  browser: string;
  operating_system: string;
  visit_date: string;
  is_mobile: boolean;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueCountries: number;
  mobilePercentage: number;
  topPages: Array<{ page: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  deviceStats: Array<{ device: string; count: number }>;
}

const VisitorStatistics = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    uniqueCountries: 0,
    mobilePercentage: 0,
    topPages: [],
    topReferrers: [],
    topCountries: [],
    deviceStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitorData();
  }, []);

  const fetchVisitorData = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/track_visitors.php');
      const result = await response.json();
      
      if (result.status === 'success') {
        const visitorData = result.data.map((visitor: any) => ({
          id: visitor.id,
          ip_address: visitor.ip_address,
          page_visited: visitor.page_visited,
          referrer: visitor.referrer || 'Direct',
          city: visitor.city,
          country: visitor.country,
          device_type: visitor.device_type,
          browser: visitor.browser,
          operating_system: visitor.operating_system,
          visit_date: visitor.visit_date,
          is_mobile: visitor.is_mobile === '1' || visitor.is_mobile === 1
        }));
        
        setVisitors(visitorData);
        calculateStats(visitorData);
      } else {
        console.error('Error fetching visitor data:', result.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (visitorData: Visitor[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisitors = visitorData.filter(v => v.visit_date.startsWith(today));
    
    const countries = [...new Set(visitorData.map(v => v.country))];
    const mobileCount = visitorData.filter(v => v.is_mobile).length;
    
    // Top pages
    const pageCount: { [key: string]: number } = {};
    visitorData.forEach(v => {
      pageCount[v.page_visited] = (pageCount[v.page_visited] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));

    // Top referrers
    const referrerCount: { [key: string]: number } = {};
    visitorData.forEach(v => {
      referrerCount[v.referrer] = (referrerCount[v.referrer] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));

    // Top countries
    const countryCount: { [key: string]: number } = {};
    visitorData.forEach(v => {
      countryCount[v.country] = (countryCount[v.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Device stats
    const deviceCount: { [key: string]: number } = {};
    visitorData.forEach(v => {
      deviceCount[v.device_type] = (deviceCount[v.device_type] || 0) + 1;
    });
    const deviceStats = Object.entries(deviceCount)
      .map(([device, count]) => ({ device, count }));

    setStats({
      totalVisitors: visitorData.length,
      todayVisitors: todayVisitors.length,
      uniqueCountries: countries.length,
      mobilePercentage: Math.round((mobileCount / visitorData.length) * 100),
      topPages,
      topReferrers,
      topCountries,
      deviceStats
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatReferrer = (referrer: string) => {
    if (referrer === 'Direct') return 'Direct';
    try {
      const url = new URL(referrer);
      return url.hostname.replace('www.', '');
    } catch {
      return referrer;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Visiteurs</p>
              <p className="text-2xl font-bold text-primary">{stats.totalVisitors}</p>
            </div>
            <Eye className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Visiteurs Aujourd'hui</p>
              <p className="text-2xl font-bold text-primary">{stats.todayVisitors}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pays Uniques</p>
              <p className="text-2xl font-bold text-primary">{stats.uniqueCountries}</p>
            </div>
            <Globe className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">% Mobile</p>
              <p className="text-2xl font-bold text-primary">{stats.mobilePercentage}%</p>
            </div>
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Pages les Plus Visitées
          </h3>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{page.page}</span>
                <Badge variant="secondary">{page.count} visites</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Sources de Trafic
          </h3>
          <div className="space-y-3">
            {stats.topReferrers.map((ref, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{formatReferrer(ref.referrer)}</span>
                <Badge variant="secondary">{ref.count} visites</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Countries */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pays des Visiteurs
          </h3>
          <div className="space-y-3">
            {stats.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{country.country}</span>
                <Badge variant="secondary">{country.count} visites</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Stats */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Types d'Appareils
          </h3>
          <div className="space-y-3">
            {stats.deviceStats.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device.device)}
                  <span className="text-sm text-foreground capitalize">{device.device}</span>
                </div>
                <Badge variant="secondary">{device.count} visites</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Visitors */}
      <Card className="card-elegant p-6">
        <h3 className="text-lg font-semibold mb-4">Visiteurs Récents</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">IP</th>
                <th className="text-left p-2">Page</th>
                <th className="text-left p-2">Localisation</th>
                <th className="text-left p-2">Appareil</th>
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 10).map((visitor) => (
                <tr key={visitor.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-xs">{visitor.ip_address}</td>
                  <td className="p-2">{visitor.page_visited}</td>
                  <td className="p-2">{visitor.city}, {visitor.country}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(visitor.device_type)}
                      <span className="capitalize">{visitor.device_type}</span>
                    </div>
                  </td>
                  <td className="p-2">{formatReferrer(visitor.referrer)}</td>
                  <td className="p-2">{new Date(visitor.visit_date).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VisitorStatistics;