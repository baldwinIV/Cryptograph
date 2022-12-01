import Image from 'next/image'
import TextField from '@mui/material/TextField'

import { styled } from '@mui/material/styles'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import SearchInput from './searchInput'

const GNBContainer = styled('div')`
  display: flex;
  height: 96px;
  background-color: ${props => props.theme.palette.primary.main};
  ${props => props.theme.breakpoints.down('tablet')} {
    height: 64px;
  }
  ${props => props.theme.breakpoints.up('tablet')} {
    background-color: ${props => props.theme.palette.primary.dark};
  }
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export default function GNB() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'))
  return (
    <GNBContainer>
      <Container maxWidth="max" sx={{ display: 'flex', alignItems: 'center' }}>
        {isMobile ? (
          <Image src="/logo-only-white.svg" alt="" width={40} height={40} />
        ) : (
          <Image src="/logo-white.svg" alt="" width={200} height={48} />
        )}
        <SearchInput />
      </Container>
    </GNBContainer>
  )
}