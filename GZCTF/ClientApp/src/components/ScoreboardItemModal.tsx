import dayjs from 'dayjs'
import { FC } from 'react'
import {
  Group,
  Text,
  Modal,
  ModalProps,
  ScrollArea,
  Stack,
  Table,
  Progress,
  Center,
  LoadingOverlay,
} from '@mantine/core'
import { useTableStyles } from '@Utils/ThemeOverride'
import { ChallengeInfo, ScoreboardItem, SubmissionType } from '@Api'
import TeamRadarMap from './TeamRadarMap'

interface ScoreboardItemModalProps extends ModalProps {
  item?: ScoreboardItem | null
  challenges?: Record<string, ChallengeInfo[]>
}

const BloodsMap = new Map([
  [undefined, undefined],
  [SubmissionType.FirstBlood, '+5%'],
  [SubmissionType.SecondBlood, '+3%'],
  [SubmissionType.ThirdBlood, '+1%'],
])

const ScoreboardItemModal: FC<ScoreboardItemModalProps> = (props) => {
  const { item, challenges, ...modalProps } = props
  const { classes } = useTableStyles()

  const challengeIdMap =
    challenges &&
    Object.keys(challenges).reduce((map, key) => {
      challenges[key].forEach((challenge) => {
        map.set(challenge.id!, challenge)
      })
      return map
    }, new Map<number, ChallengeInfo>())

  const solved = (item?.solvedCount ?? 0) / (item?.challenges?.length ?? 1)

  const indicator =
    challenges &&
    Object.keys(challenges).map((tag) => ({
      name: tag,
      maxScore: challenges[tag].reduce((sum, chal) => sum + (!chal.solved ? 0 : chal.score!), 0),
      max: 1,
    }))

  const values = new Array(item?.challenges?.length ?? 0).fill(0)

  item?.challenges?.forEach((chal) => {
    if (indicator && challengeIdMap && chal) {
      const challenge = challengeIdMap.get(chal.id!)
      const index = challenge && indicator?.findIndex((ch) => ch.name == challenge.tag)
      if (chal?.score && challenge?.score && index !== undefined && index !== -1) {
        values[index] += challenge?.score / indicator[index].maxScore
      }
    }
  })

  item?.challenges?.sort((a, b) => (dayjs(a.time) < dayjs(b.time) ? 1 : -1))

  return (
    <Modal {...modalProps}>
      <Stack align="center" spacing="xs">
        <Stack style={{ width: '60%', minWidth: '20rem' }}>
          <Center style={{ height: '14rem' }}>
            <LoadingOverlay visible={!indicator || !values} />
            {indicator && values && (
              <TeamRadarMap indicator={indicator} value={values} name={item?.name ?? ''} />
            )}
          </Center>
          <Group
            grow
            style={{
              textAlign: 'center',
            }}
          >
            <Stack spacing={2}>
              <Text weight={700} size="sm" className={classes.mono}>
                {item?.rank}
              </Text>
              <Text size="sm">排名</Text>
            </Stack>
            <Stack spacing={2}>
              <Text weight={700} size="sm" className={classes.mono}>
                {item?.score}
              </Text>
              <Text size="sm">得分</Text>
            </Stack>
            <Stack spacing={2}>
              <Text weight={700} size="sm" className={classes.mono}>
                {item?.solvedCount}
              </Text>
              <Text size="sm">攻克数量</Text>
            </Stack>
          </Group>
          <Progress value={solved * 100} />
        </Stack>
        {item?.solvedCount && item?.solvedCount > 0 ? (
          <ScrollArea scrollbarSize={6} style={{ height: '12rem', width: '100%' }}>
            <Table className={classes.table}>
              <thead>
                <tr>
                  <th>用户</th>
                  <th>题目</th>
                  <th>类型</th>
                  <th>得分</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {item?.challenges &&
                  challengeIdMap &&
                  item.challenges
                    .filter((c) => c.type !== SubmissionType.Unaccepted)
                    .map((chal) => {
                      const info = challengeIdMap.get(chal.id!)
                      return (
                        <tr>
                          <td style={{ fontWeight: 500 }}>{chal.userName}</td>
                          <td>{info?.title}</td>
                          <td className={classes.mono}>{info?.tag}</td>
                          <td className={classes.mono}>
                            {chal.score}
                            {chal.score! > info?.score! && (
                              <Text span color="dimmed" className={classes.mono}>
                                {` (${BloodsMap.get(chal.type)})`}
                              </Text>
                            )}
                          </td>
                          <td className={classes.mono}>
                            {dayjs(chal.time).format('MM/DD HH:mm:ss')}
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Text py="1rem" weight={700}>
            Ouch! 这支队伍还没有解出题目呢……
          </Text>
        )}
      </Stack>
    </Modal>
  )
}

export default ScoreboardItemModal
