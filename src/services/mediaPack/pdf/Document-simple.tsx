import React from "react";
import {
  Document, Page, Text, View, StyleSheet
} from "@react-pdf/renderer";

// Simple styles without custom fonts
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  }
});

type Theme = {
  brandColor: string;
  dark?: boolean;
};

type Payload = {
  creator?: {
    displayName?: string;
    bio?: string;
  };
};

export function MediaPackPDF({ payload, theme, variant }: { payload: Payload; theme: Theme; variant: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.header}>Media Pack</Text>
          <Text style={styles.content}>
            Creator: {payload.creator?.displayName || 'Unknown'}
          </Text>
          <Text style={styles.content}>
            Bio: {payload.creator?.bio || 'No bio available'}
          </Text>
          <Text style={styles.content}>
            Theme: {theme.brandColor}
          </Text>
          <Text style={styles.content}>
            Variant: {variant}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
