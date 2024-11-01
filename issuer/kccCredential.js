class KccCredential {
  constructor(country, tier, jurisdiction, credentialSchema, evidence) {
    this.data = {
      countryOfResidence: country,
      tier: tier, // optional
      jurisdiction: jurisdiction, // optional
    };
    this.credentialSchema = credentialSchema;
    this.evidence = evidence; // optional
  }
}

export default KccCredential;
