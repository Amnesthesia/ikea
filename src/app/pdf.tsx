import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { capitalize } from 'lodash';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    height: '210mm',
    width: '297mm',
  },
  section: {
    width: '50%',
    height: '210mm',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '26pt',
    fontWeight: 'bold',
    fontFamily: 'Helvetica'
  },
  subtitle: {
    fontSize: '18pt',
    fontWeight: 'normal',
    fontFamily: 'Helvetica'
  },
  border: {
    width: '50%',
    height: 1,
    backgroundColor: '#000',
    marginTop: 8,
    marginBottom: 8
  },
  image: {
    width: '30%',
    minHeight: 200,
    marginBottom: 32
  },
  type: {
    position: 'absolute',
    top: 32,
    right: 32,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    fontSize: '14pt'
  }
});

export interface PDFProps {
  word: string;
  variations?: string[];
  type?: string;
  image?: string;
}

export function PDF(props: PDFProps) {
  const { image, type, variations, word } = props;

  return (
    <PDFViewer width="100%" style={{ height: '100vh'}}>
      <Document>
        <Page size="A4" style={styles.page} orientation='landscape'>
          <View style={styles.section}>
            {type && <Text style={styles.type}>{type || ''}</Text>}
            {image && <Image src={image} style={styles.image} />}
            <Text style={styles.label}>{capitalize(word || '')}</Text>
            {!variations?.length ? null : <><View style={styles.border} /><Text style={styles.subtitle}>{variations?.join(' / ')}</Text></>}
          </View>
          <View style={styles.section}>
            {type && <Text style={styles.type}>{type || ''}</Text>}
            {image && <Image src={image} style={styles.image} />}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}

