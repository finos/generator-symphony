# How to add a certificate to the truststore

## Jks TrustStore `all_symphony_certs_truststore`
To add a new certificate to the jks trustStore, we should use the [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html)
to import it to the trustStore `all_symphony_certs_truststore`.

```
keytool -import -alias <your-cert-alias> -file path/to/your/cert -keystore all_symphony_certs_truststore -keypass changeit
```

## Pem TrustStore `all_symphony_certs.pem`
To add a new certificate to the pem trustStore, we only need to append your certificate to
the end of the pem trustStore `all_symphony_certs.pem`

```
cat path/to/your/cert >> all_symphony_certs.pem
```
