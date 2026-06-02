import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  bold: { fontWeight: "bold" },
  signature: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 4,
    width: "80%",
  },
  signatureLine: {
    fontSize: 10,
  },
  signatureLabel: {
    fontSize: 9,
    marginTop: 4,
    marginBottom: 4,
  },
});
