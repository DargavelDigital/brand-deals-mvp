const url = process.env.DATABASE_URL || ''
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error('Invalid DATABASE_URL protocol. Expect postgres:// or postgresql://')
  process.exit(1)
}
