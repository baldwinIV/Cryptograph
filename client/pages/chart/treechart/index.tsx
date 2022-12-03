import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'
import TreeChart from '@/components/Treechart'
import { getTreeData, updateTreeData } from '@/components/Treechart/getCoinData'
import { useEffect, useState } from 'react'
export default function TreeChartPage() {
  const [updateData, setUpdateData] = useState()
  useEffect(() => {
    getTreeData().then(data => {
      setUpdateData(data)
    })
  }, [])

  return (
    <HomeContainer>
      <TreeChart data={updateData} />
    </HomeContainer>
  )
}

const HomeContainer = styled(Box)`
  display: flex;
  width: 100%;
  max-width: 1920px;
  height: 100%;
  align-items: center;
  ${props => props.theme.breakpoints.down('tablet')} {
    flex-direction: column;
  }
`
