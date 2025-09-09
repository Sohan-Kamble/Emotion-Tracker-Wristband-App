'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Brain, 
  Play, 
  Pause, 
  Download,
  Settings,
  TrendingUp,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Battery,
  Bluetooth
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Types
interface SensorData {
  timestamp: number;
  heartRate: number;
  eda: number; // Electrodermal Activity
  temperature: number;
  emotion: string;
  confidence: number;
}

interface EmotionState {
  emotion: string;
  confidence: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description: string;
}

// Emotion configurations
const EMOTIONS: Record<string, EmotionState> = {
  calm: {
    emotion: 'Calm',
    confidence: 0,
    color: '#10B981',
    icon: Smile,
    description: 'Relaxed and peaceful state'
  },
  happy: {
    emotion: 'Happy',
    confidence: 0,
    color: '#F59E0B',
    icon: Smile,
    description: 'Positive and joyful state'
  },
  stressed: {
    emotion: 'Stressed',
    confidence: 0,
    color: '#EF4444',
    icon: Frown,
    description: 'High tension and anxiety'
  },
  focused: {
    emotion: 'Focused',
    confidence: 0,
    color: '#3B82F6',
    icon: Brain,
    description: 'Concentrated and alert'
  },
  neutral: {
    emotion: 'Neutral',
    confidence: 0,
    color: '#6B7280',
    icon: Meh,
    description: 'Balanced emotional state'
  }
};

// Simulated ML Classification Function
const classifyEmotion = (heartRate: number, eda: number, temperature: number): { emotion: string; confidence: number } => {
  // Simplified SVM-inspired classification logic
  const features = [
    (heartRate - 70) / 50, // Normalized heart rate
    (eda - 5) / 10,        // Normalized EDA
    (temperature - 36.5) / 2 // Normalized temperature
  ];
  
  // Simulate SVM decision boundaries
  const calmScore = -features[0] * 0.5 - features[1] * 0.3 + features[2] * 0.2;
  const happyScore = features[0] * 0.3 - features[1] * 0.2 + features[2] * 0.4;
  const stressedScore = features[0] * 0.8 + features[1] * 0.6 - features[2] * 0.1;
  const focusedScore = features[0] * 0.4 + features[1] * 0.1 + features[2] * 0.1;
  const neutralScore = -Math.abs(features[0]) - Math.abs(features[1]) - Math.abs(features[2]);
  
  const scores = {
    calm: calmScore,
    happy: happyScore,
    stressed: stressedScore,
    focused: focusedScore,
    neutral: neutralScore
  };
  
  const maxEmotion = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const confidence = Math.min(94 + Math.random() * 6, 100); // Simulate 94%+ accuracy
  
  return { emotion: maxEmotion, confidence };
};

// Generate realistic sensor data
const generateSensorData = (prevData?: SensorData): SensorData => {
  const baseHeartRate = 72;
  const baseEDA = 6;
  const baseTemp = 36.8;
  
  const heartRate = Math.max(50, Math.min(120, 
    (prevData?.heartRate || baseHeartRate) + (Math.random() - 0.5) * 8
  ));
  
  const eda = Math.max(2, Math.min(15,
    (prevData?.eda || baseEDA) + (Math.random() - 0.5) * 2
  ));
  
  const temperature = Math.max(35.5, Math.min(38.5,
    (prevData?.temperature || baseTemp) + (Math.random() - 0.5) * 0.4
  ));
  
  const { emotion, confidence } = classifyEmotion(heartRate, eda, temperature);
  
  return {
    timestamp: Date.now(),
    heartRate: Number(heartRate.toFixed(1)),
    eda: Number(eda.toFixed(2)),
    temperature: Number(temperature.toFixed(1)),
    emotion,
    confidence: Number(confidence.toFixed(1))
  };
};

export default function EmotionTrackerDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentReading, setCurrentReading] = useState<SensorData | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize with sample data
  useEffect(() => {
    const initialData: SensorData[] = [];
    let lastReading = generateSensorData();
    
    for (let i = 0; i < 50; i++) {
      lastReading = generateSensorData(lastReading);
      lastReading.timestamp = Date.now() - (50 - i) * 30000; // 30 seconds intervals
      initialData.push(lastReading);
    }
    
    setSensorData(initialData);
    setCurrentReading(lastReading);
  }, []);

  // Real-time data simulation
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const newReading = generateSensorData(currentReading || undefined);
      setSensorData(prev => [...prev.slice(-100), newReading]); // Keep last 100 readings
      setCurrentReading(newReading);
      
      // Simulate battery drain
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking, currentReading]);

  const currentEmotion = currentReading ? EMOTIONS[currentReading.emotion] : EMOTIONS.neutral;
  const EmotionIcon = currentEmotion.icon;

  // Prepare chart data
  const recentData = sensorData.slice(-20).map((data, index) => ({
    time: new Date(data.timestamp).toLocaleTimeString(),
    heartRate: data.heartRate,
    eda: data.eda,
    temperature: data.temperature,
    confidence: data.confidence
  }));

  // Emotion distribution data
  const emotionCounts = sensorData.reduce((acc, data) => {
    acc[data.emotion] = (acc[data.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: EMOTIONS[emotion]?.emotion || emotion,
    value: count,
    fill: EMOTIONS[emotion]?.color || '#6B7280'
  }));

  // Physiological profile data for radar chart
  const avgHeartRate = sensorData.reduce((sum, d) => sum + d.heartRate, 0) / sensorData.length;
  const avgEDA = sensorData.reduce((sum, d) => sum + d.eda, 0) / sensorData.length;
  const avgTemp = sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length;

  const radarData = [
    {
      subject: 'Heart Rate',
      current: currentReading?.heartRate || 0,
      average: avgHeartRate,
      fullMark: 120
    },
    {
      subject: 'EDA',
      current: currentReading?.eda || 0,
      average: avgEDA,
      fullMark: 15
    },
    {
      subject: 'Temperature',
      current: (currentReading?.temperature || 0) * 10, // Scale for visibility
      average: avgTemp * 10,
      fullMark: 380
    }
  ];

  const exportData = () => {
    const dataStr = JSON.stringify(sensorData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emotion-tracker-data.json';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Emotion Tracker Wristband
          </h1>
          <p className="text-gray-600">Real-time physiological emotion monitoring with AI classification</p>
        </div>

        {/* Status Bar */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Bluetooth className={`w-5 h-5 ${isConnected ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isConnected ? 'text-blue-600' : 'text-gray-500'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{batteryLevel.toFixed(0)}%</span>
                  <Progress value={batteryLevel} className="w-16" />
                </div>
                <Button
                  onClick={() => setIsTracking(!isTracking)}
                  variant={isTracking ? "destructive" : "default"}
                  className="flex items-center space-x-2"
                >
                  {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTracking ? 'Stop' : 'Start'} Tracking</span>
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Current Emotion */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Current Emotion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentEmotion.color }}
                  />
                  <span className="text-2xl font-bold" style={{ color: currentEmotion.color }}>
                    {currentEmotion.emotion}
                  </span>
                </div>
                <EmotionIcon className="w-6 h-6" style={{ color: currentEmotion.color }} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span className="font-medium">{currentReading?.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={currentReading?.confidence || 0} className="h-2" />
              </div>
              <p className="text-xs text-gray-500">{currentEmotion.description}</p>
            </CardContent>
          </Card>

          {/* Heart Rate */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-500">
                  {currentReading?.heartRate || '--'} <span className="text-sm text-gray-500">BPM</span>
                </div>
                <Badge variant={
                  (currentReading?.heartRate || 0) > 100 ? "destructive" :
                  (currentReading?.heartRate || 0) < 60 ? "secondary" : "default"
                }>
                  {(currentReading?.heartRate || 0) > 100 ? 'High' :
                   (currentReading?.heartRate || 0) < 60 ? 'Low' : 'Normal'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* EDA */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                EDA Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-500">
                  {currentReading?.eda || '--'} <span className="text-sm text-gray-500">μS</span>
                </div>
                <Badge variant={
                  (currentReading?.eda || 0) > 10 ? "destructive" :
                  (currentReading?.eda || 0) < 3 ? "secondary" : "default"
                }>
                  {(currentReading?.eda || 0) > 10 ? 'High Arousal' :
                   (currentReading?.eda || 0) < 3 ? 'Low Arousal' : 'Normal'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-500">
                  {currentReading?.temperature || '--'} <span className="text-sm text-gray-500">°C</span>
                </div>
                <Badge variant={
                  (currentReading?.temperature || 0) > 37.5 ? "destructive" :
                  (currentReading?.temperature || 0) < 36 ? "secondary" : "default"
                }>
                  {(currentReading?.temperature || 0) > 37.5 ? 'High' :
                   (currentReading?.temperature || 0) < 36 ? 'Low' : 'Normal'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="realtime" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Physiological Signals</CardTitle>
                  <CardDescription>Real-time sensor readings over the last 10 minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={recentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={2} name="Heart Rate" />
                      <Line type="monotone" dataKey="eda" stroke="#3B82F6" strokeWidth={2} name="EDA" />
                      <Line type="monotone" dataKey="temperature" stroke="#F97316" strokeWidth={2} name="Temperature (×10)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Model Confidence</CardTitle>
                  <CardDescription>AI classification accuracy over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={recentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="confidence" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Emotion Distribution</CardTitle>
                  <CardDescription>Emotional states over the current session</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Physiological Profile</CardTitle>
                  <CardDescription>Current vs average readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Radar name="Average" dataKey="average" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{Math.floor(sensorData.length * 30 / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Points</span>
                    <span className="font-medium">{sensorData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Confidence</span>
                    <span className="font-medium">
                      {(sensorData.reduce((sum, d) => sum + d.confidence, 0) / sensorData.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dominant Emotion</span>
                    <span className="font-medium">
                      {sensorData.length > 0 ? Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Health Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Heart Rate</span>
                    <span className="font-medium">{avgHeartRate.toFixed(0)} BPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg EDA</span>
                    <span className="font-medium">{avgEDA.toFixed(2)} μS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Temperature</span>
                    <span className="font-medium">{avgTemp.toFixed(1)} °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stress Episodes</span>
                    <span className="font-medium text-red-500">{emotionCounts.stressed || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Algorithm</span>
                    <span className="font-medium">SVM Classifier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Features</span>
                    <span className="font-medium">3 (HR, EDA, Temp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classes</span>
                    <span className="font-medium">5 Emotions</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Wellness Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your stress levels have been elevated for the past 15 minutes. Consider taking a short break.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Take 5 deep breaths to reduce EDA levels</li>
                      <li>• Consider a 2-minute meditation session</li>
                      <li>• Stay hydrated to maintain optimal temperature</li>
                      <li>• Your heart rate variability indicates good fitness</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Patterns Detected:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Peak focus occurs around current time</li>
                      <li>• Stress correlates with elevated heart rate</li>
                      <li>• Temperature stable throughout session</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                  <CardDescription>System specifications and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Sensor Configuration:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Heart Rate: Photoplethysmography (PPG)</li>
                      <li>• EDA: Galvanic skin response sensors</li>
                      <li>• Temperature: Thermistor array</li>
                      <li>• Sampling Rate: 1 Hz continuous</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">ML Pipeline:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Feature extraction: 3D physiological vector</li>
                      <li>• Preprocessing: Noise filtering & normalization</li>
                      <li>• Classification: Support Vector Machine</li>
                      <li>• Training data: 10,000+ labeled samples</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Hardware:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• ESP32 microcontroller</li>
                      <li>• Bluetooth 5.0 connectivity</li>
                      <li>• 400mAh Li-Po battery</li>
                      <li>• 24-hour continuous operation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-8">
          <p>© 2024 Emotion Tracker Wristband - Advanced Physiological Monitoring System</p>
          <p>Machine Learning Model: SVM with 94.2% accuracy | Real-time Classification</p>
        </div>
      </div>
    </div>
  );
}