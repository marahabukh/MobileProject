import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { getSecurely } from "../lib/SecureStorage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1);
    translateY.value = withSpring(0);

    const checkSessionAndNavigate = async () => {
      // Small delay to show the beautiful splash screen
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const session = await getSecurely("user_session");
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/Auth/login");
      }
    };

    checkSessionAndNavigate();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <LinearGradient
        colors={["#E35D5B", "#C04848"]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>LUXY</Text>
            <View style={styles.underline} />
          </View>
          <Text style={styles.tagline}>ELEVATE YOUR STYLE</Text>
        </Animated.View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  appName: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: "#FFFFFF",
    marginTop: -5,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 4,
    fontWeight: "600",
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    letterSpacing: 2,
  },
});
